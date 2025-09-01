package com.torrent.streaming.upload_service.service;

import com.torrent.streaming.upload_service.client.OmdbClient;
import com.torrent.streaming.upload_service.exception.UploadServiceException;
import com.torrent.streaming.upload_service.model.FileInfo;
import com.torrent.streaming.upload_service.model.OmdbResponse;
import com.torrent.streaming.upload_service.model.TorrentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static com.torrent.streaming.upload_service.utils.UploadServiceHelpers.getMovieNameAndYear;
import static com.torrent.streaming.upload_service.utils.UploadServiceHelpers.sanitizeTorrentUrl;

@Service
@Slf4j
public class TorrentService {
    private static final String BASE_URL = "http://localhost:3000/api/torrent";
    private static final Duration POLL_DURATION = Duration.ofSeconds(10);


    private final OciUploadService ociUploadService;
    private final OmdbClient omdbClient;
    private final MovieService movieService;

    private final RestClient rc = RestClient.builder().baseUrl(BASE_URL).build();
    private final ExecutorService asyncPool = Executors.newVirtualThreadPerTaskExecutor();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    @Autowired
    public TorrentService(OciUploadService ociUploadService, OmdbClient omdbClient, MovieService movieService) {
        this.ociUploadService = ociUploadService;
        this.omdbClient = omdbClient;
        this.movieService = movieService;
    }

    public void orchestrateTorrentUpload(String torrentUrl) {
        // Step 1: Start download
        log.info("📥 Starting torrent download...");
        startTorrentDownload(torrentUrl);

        // Step 2: Get movie title and year
        List<String> response = getMovieNameAndYear(getCurrentTorrentStatus());
        String title = response.getFirst();
        String year = response.getLast();
        log.info("Movie information: {}, {}", title, year);

        // Step 3: Kick off 2 async tasks - poll for download status and get OMDB response
        CompletableFuture<TorrentStatus> downloadFuture = pollTorrentDownloadStatusAsync();
        CompletableFuture<Optional<OmdbResponse>> omdbFuture =
                CompletableFuture.supplyAsync(() -> omdbClient.fetchMovieDetails(title, year), asyncPool)
                        .exceptionally(ex -> {
                            log.warn("OMDB lookup failed: {}", ex.toString());
                            return Optional.empty();
                        });

        // Step 4: Wait for download to finish. OMDB results should be available by now.
        TorrentStatus status = downloadFuture.join();
        log.info("✅ Download complete. Took {} seconds. Uploading files...", status.getDurationSeconds());

        // Step 5: Upload all files in parallel to OCI object store
        List<FileInfo> files = status.getFiles();
        String basePath = status.getDownloadPath();
        ociUploadService.uploadFiles(files, basePath);

        // Step 6: Save Movie entity to MongoDB
        movieService.saveMovie(omdbFuture, files);

        // Step 7: Clean up downloaded torrent
        log.info("🧹 Cleaning up...");
        rc.delete();
    }

    private void startTorrentDownload(String torrentUrl) {
        RestClient postClient = RestClient.builder().baseUrl(BASE_URL)
                .defaultStatusHandler(HttpStatusCode::is4xxClientError, (req, res) ->
                        log.error("⛔️ Another torrent is already downloading - showing status instead"))
                .build();
        postClient.post().uri(uriBuilder -> uriBuilder
                        .queryParam("torrentUrl", sanitizeTorrentUrl(torrentUrl)).build())
                .retrieve().toBodilessEntity();
    }

    private CompletableFuture<TorrentStatus> pollTorrentDownloadStatusAsync() {
        CompletableFuture<TorrentStatus> result = new CompletableFuture<>();
        AtomicReference<ScheduledFuture<?>> handleRef = new AtomicReference<>();

        Runnable pollTask = () -> {
            try {
                TorrentStatus status = getCurrentTorrentStatus();
                if (status == null) {
                    return;
                }
                log.info("⏳ Progress: {}%, Downloaded: {} bytes",
                        status.getProgress(), status.getDownloadedBytes());

                if (status.isDone()) {
                    result.complete(status);
                    ScheduledFuture<?> handle = handleRef.getAndSet(null);
                    if (handle != null) handle.cancel(false);
                }
            } catch (Exception e) {
                if (!result.isDone()) result.completeExceptionally(
                        new UploadServiceException("Failed to get torrent status", e));
                ScheduledFuture<?> handle = handleRef.getAndSet(null);
                if (handle != null) handle.cancel(false);
            }
        };

        ScheduledFuture<?> handle = scheduler.scheduleAtFixedRate(
                pollTask, 0, POLL_DURATION.toMillis(), TimeUnit.MILLISECONDS);
        handleRef.set(handle);
        return result;
    }

    private TorrentStatus getCurrentTorrentStatus() {
        return rc.get().uri("/status").retrieve().body(TorrentStatus.class);
    }
}