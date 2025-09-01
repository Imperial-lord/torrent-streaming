package com.torrent.streaming.streaming_service.service;

import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.model.CreatePreauthenticatedRequestDetails;
import com.oracle.bmc.objectstorage.model.PreauthenticatedRequest;
import com.oracle.bmc.objectstorage.requests.CreatePreauthenticatedRequestRequest;
import com.oracle.bmc.objectstorage.responses.CreatePreauthenticatedRequestResponse;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Date;

@Service
public class VideoPARService {
    private final ObjectStorageClient objectStorageClient;
    private final String namespace;
    private final String bucketName;

    public VideoPARService(ObjectStorageClient objectStorageClient, OciSecretManagerService ociSecretManagerService) {
        this.objectStorageClient = objectStorageClient;
        this.namespace = ociSecretManagerService.getNamespace();
        this.bucketName = ociSecretManagerService.getBucketName();
    }

    public String generateParUrl(String objectName, int expiryMinutes) {
        // Expiration time
        Date timeExpires = Date.from(ZonedDateTime.now().plusMinutes(expiryMinutes).toInstant());

        CreatePreauthenticatedRequestDetails details =
                CreatePreauthenticatedRequestDetails.builder()
                        .name("par-" + objectName + "-" + System.currentTimeMillis())
                        .objectName(objectName)
                        .accessType(CreatePreauthenticatedRequestDetails.AccessType.ObjectRead)
                        .timeExpires(timeExpires)
                        .build();

        CreatePreauthenticatedRequestRequest request =
                CreatePreauthenticatedRequestRequest.builder()
                        .bucketName(bucketName)
                        .namespaceName(namespace)
                        .createPreauthenticatedRequestDetails(details)
                        .build();

        CreatePreauthenticatedRequestResponse response =
                objectStorageClient.createPreauthenticatedRequest(request);

        PreauthenticatedRequest par = response.getPreauthenticatedRequest();
        return par.getFullPath();
    }
}