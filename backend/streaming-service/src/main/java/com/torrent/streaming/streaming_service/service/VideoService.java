package com.torrent.streaming.streaming_service.service;

import com.oracle.bmc.model.Range;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.requests.GetObjectRequest;
import com.oracle.bmc.objectstorage.requests.HeadObjectRequest;
import com.oracle.bmc.objectstorage.responses.GetObjectResponse;
import com.oracle.bmc.objectstorage.responses.HeadObjectResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

@Service
public class VideoService {
    private final ObjectStorageClient objectStorageClient;
    private final String namespace;
    private final String bucketName;

    public VideoService(ObjectStorageClient objectStorageClient, OciSecretManagerService ociSecretManagerService) {
        this.objectStorageClient = objectStorageClient;
        this.namespace = ociSecretManagerService.getNamespace();
        this.bucketName = ociSecretManagerService.getBucketName();
    }

    public GetObjectResponse streamVideo(String objectName, String range, HttpServletResponse response) {
        HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucketName(bucketName)
                .namespaceName(namespace)
                .objectName(objectName)
                .build();

        HeadObjectResponse headResponse = objectStorageClient.headObject(headRequest);
        long fileSize = headResponse.getContentLength();

        // Determine range
        long start = 0;
        long end = fileSize - 1;
        if (range != null && range.startsWith("bytes=")) {
            String[] ranges = range.substring(6).split("-");
            start = Long.parseLong(ranges[0]);
            if (ranges.length > 1 && !ranges[1].isEmpty()) {
                end = Long.parseLong(ranges[1]);
            }
        }

        long contentLength = end - start + 1;

        // Get partial content
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucketName(bucketName)
                .namespaceName(namespace)
                .objectName(objectName)
                .range(new Range(start, end))
                .build();

        // Set headers
        response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        response.setContentType("video/mp4");
        response.setHeader("Accept-Ranges", "bytes");
        response.setHeader("Content-Range", String.format("bytes %d-%d/%d", start, end, fileSize));
        response.setHeader("Content-Length", String.valueOf(contentLength));

        return objectStorageClient.getObject(getObjectRequest);
    }
}
