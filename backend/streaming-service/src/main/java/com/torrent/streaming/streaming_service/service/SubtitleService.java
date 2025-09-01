package com.torrent.streaming.streaming_service.service;

import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.requests.GetObjectRequest;
import com.oracle.bmc.objectstorage.responses.GetObjectResponse;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Service
public class SubtitleService {
    private final ObjectStorageClient objectStorageClient;
    private final String namespace;
    private final String bucketName;

    public SubtitleService(ObjectStorageClient objectStorageClient, OciSecretManagerService ociSecretManagerService) {
        this.objectStorageClient = objectStorageClient;
        this.namespace = ociSecretManagerService.getNamespace();
        this.bucketName = ociSecretManagerService.getBucketName();
    }

    public InputStream getSubtitles(String subtitlesPath) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucketName(bucketName)
                .namespaceName(namespace)
                .objectName(subtitlesPath)
                .build();

        GetObjectResponse getObjectResponse = objectStorageClient.getObject(getObjectRequest);
        String srtContent = new BufferedReader(new InputStreamReader(getObjectResponse.getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));

        String vttContent = "WEBVTT\n\n" + srtContent.replace(",", ".");
        return new ByteArrayInputStream(vttContent.getBytes(StandardCharsets.UTF_8));
    }
}
