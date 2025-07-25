package com.torrent.streaming.upload_service.service;

import com.torrent.streaming.upload_service.exception.UploadServiceException;
import com.torrent.streaming.upload_service.model.FileInfo;
import com.torrent.streaming.upload_service.model.OciUploadRequest;
import com.torrent.streaming.upload_service.strategy.upload.MultipartUploadStrategy;
import com.torrent.streaming.upload_service.strategy.upload.SimpleUploadStrategy;
import com.torrent.streaming.upload_service.strategy.upload.UploadStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static com.torrent.streaming.upload_service.constant.AppConstants.PART_SIZE;

@Service
@Slf4j
public class OciUploadService {
    private final MultipartUploadStrategy multipartUploadStrategy;
    private final SimpleUploadStrategy simpleUploadStrategy;

    public OciUploadService(MultipartUploadStrategy multipartUploadStrategy, SimpleUploadStrategy simpleUploadStrategy) {
        this.multipartUploadStrategy = multipartUploadStrategy;
        this.simpleUploadStrategy = simpleUploadStrategy;
    }

    public void uploadFiles(List<FileInfo> files, String basePath) {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (FileInfo file : files) {
                Path filePath = Path.of(basePath, file.getName());
                long fileSize = file.getLengthBytes();
                String objectName = file.getPath();

                if (!Files.exists(filePath)) continue;

                executor.submit(() -> {
                    try {
                        OciUploadRequest ociUploadRequest = OciUploadRequest.builder()
                                .objectName(objectName)
                                .fileSize(fileSize)
                                .inputStream(createInputStream(filePath, fileSize))
                                .build();
                        uploadFileToOci(ociUploadRequest);
                        log.info("📤 Uploaded {}", file.getName());
                    } catch (Exception e) {
                        log.error("An error was encountered while uploading {}", file.getName());
                        log.error(e.getMessage(), e);
                    }
                });
            }
        }
    }

    private InputStream createInputStream(Path filePath, long fileSize) throws IOException {
        InputStream fileInputStream = Files.newInputStream(filePath);
        if (fileSize <= PART_SIZE) {
            return new BufferedInputStream(fileInputStream);
        } else return fileInputStream;
    }

    private void uploadFileToOci(OciUploadRequest ociUploadRequest) throws UploadServiceException {
        UploadStrategy uploadStrategy = getUploadStrategy(ociUploadRequest.getFileSize());
        if (Boolean.FALSE.equals(uploadStrategy.upload(ociUploadRequest)))
            throw new UploadServiceException("OCI upload returned false");
    }

    private UploadStrategy getUploadStrategy(long fileSize) {
        if (fileSize >= 2 * PART_SIZE) {
            return multipartUploadStrategy;
        } else return simpleUploadStrategy;
    }
}
