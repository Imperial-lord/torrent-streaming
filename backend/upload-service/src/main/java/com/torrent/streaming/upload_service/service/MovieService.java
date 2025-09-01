package com.torrent.streaming.upload_service.service;

import com.torrent.streaming.upload_service.client.TmdbClient;
import com.torrent.streaming.upload_service.entity.MovieEntity;
import com.torrent.streaming.upload_service.model.FileInfo;
import com.torrent.streaming.upload_service.model.OmdbResponse;
import com.torrent.streaming.upload_service.model.TmdbImageResponse;
import com.torrent.streaming.upload_service.repository.MovieRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static com.torrent.streaming.upload_service.utils.UploadServiceHelpers.findFirstLengthByExt;
import static com.torrent.streaming.upload_service.utils.UploadServiceHelpers.findFirstPathByExt;

@Service
@Slf4j
public class MovieService {
    private static final String MP4_EXTENSION = ".mp4";
    private static final String SRT_EXTENSION = ".srt";

    private final MovieRepository movieRepository;
    private final TmdbClient tmdbClient;

    @Autowired
    public MovieService(MovieRepository movieRepository, TmdbClient tmdbClient) {
        this.movieRepository = movieRepository;
        this.tmdbClient = tmdbClient;
    }

    public void saveMovie(CompletableFuture<Optional<OmdbResponse>> omdbFuture, List<FileInfo> files) {
        Optional<OmdbResponse> omdbResponse = omdbFuture.getNow(Optional.empty());
        String videoPath = findFirstPathByExt(files, MP4_EXTENSION).orElse(null);
        String subtitlesPath = findFirstPathByExt(files, SRT_EXTENSION).orElse(null);
        Long videoBytes = findFirstLengthByExt(files, MP4_EXTENSION).orElse(null);
        Long subtitlesBytes = findFirstLengthByExt(files, SRT_EXTENSION).orElse(null);
        omdbResponse.ifPresentOrElse(omdb -> {
                    log.debug("Omdb response is present");
                    String imdbId = omdb.getImdbID();
                    MovieEntity movieEntity = MovieEntity.builder()
                            .imdbId(imdbId)
                            .omdbResponse(omdb)
                            .tmdbImageResponse(getTmdbImageResponse(imdbId))
                            .videoPath(videoPath)
                            .videoBytes(videoBytes)
                            .subtitlesPath(subtitlesPath)
                            .subtitlesBytes(subtitlesBytes)
                            .build();
                    MovieEntity saved = movieRepository.save(movieEntity);
                    log.info("💾 Saved MovieAsset imdbID={}", saved.getImdbId());
                }, () -> log.debug("Omdb response is not present")
        );
    }

    public TmdbImageResponse getTmdbImageResponse(String imdbId) {
        return tmdbClient.fetchHighResImages(imdbId);
    }
}
