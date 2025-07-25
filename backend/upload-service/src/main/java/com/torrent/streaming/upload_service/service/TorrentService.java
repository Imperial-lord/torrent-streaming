package com.torrent.streaming.upload_service.service;

import com.torrent.streaming.upload_service.model.FileInfo;
import com.torrent.streaming.upload_service.model.TorrentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Service
@Slf4j
public class TorrentService {
    private static final String BASE_URL = "http://localhost:3000/api/torrent";
    private final RestTemplate restTemplate = new RestTemplate();
    private final OciUploadService ociUploadService;

    @Autowired
    public TorrentService(OciUploadService ociUploadService) {
        this.ociUploadService = ociUploadService;
    }

    public void orchestrateTorrentUpload(String torrentUrl) throws Exception {
        // Step 1: Start download
        log.info("📥 Starting torrent download...");
        URI uri = UriComponentsBuilder.fromUriString(BASE_URL)
                .queryParam("torrentUrl", sanitizeTorrentUrl(torrentUrl))
                .build()
                .toUri();
        restTemplate.postForEntity(uri, null, Void.class);

        // Step 2: Poll until done
        TorrentStatus status;
        do {
            Thread.sleep(10_000);
            ResponseEntity<TorrentStatus> response = restTemplate.getForEntity(BASE_URL + "/status", TorrentStatus.class);
            status = response.getBody();
            assert status != null;
            log.info("⏳ Progress: {}%, Downloaded: {} bytes", status.getProgress(), status.getDownloadedBytes());
        } while (!status.isDone());

        log.info("✅ Download complete. Took {} seconds. Uploading files...", status.getDurationSeconds());

        // Step 3: Upload all files in parallel to OCI object store
        List<FileInfo> files = status.getFiles();
        String basePath = status.getDownloadPath();
        ociUploadService.uploadFiles(files, basePath);

        // Step 4: Clean up
        log.info("🧹 Cleaning up...");
        restTemplate.delete(URI.create(BASE_URL));
    }

    // Remove backslashes before common characters that don't need escaping in shell
    private String sanitizeTorrentUrl(String url) {
        return url.replaceAll("\\\\(?=\\p{Graph})", "");
    }
}