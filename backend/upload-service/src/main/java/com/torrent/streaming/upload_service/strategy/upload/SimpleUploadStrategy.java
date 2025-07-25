package com.torrent.streaming.upload_service.strategy.upload;

import com.oracle.bmc.model.BmcException;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import com.torrent.streaming.upload_service.exception.UploadServiceException;
import com.torrent.streaming.upload_service.model.OciUploadRequest;
import com.torrent.streaming.upload_service.service.OciSecretManagerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SimpleUploadStrategy extends UploadStrategy {
    public SimpleUploadStrategy(ObjectStorageClient objectStorageClient, OciSecretManagerService ociSecretManagerService) {
        super(objectStorageClient, ociSecretManagerService);
    }

    @Override
    public Boolean upload(OciUploadRequest uploadRequest) throws UploadServiceException {
        PutObjectRequest request = PutObjectRequest.builder()
                .namespaceName(namespace)
                .bucketName(bucketName)
                .objectName(uploadRequest.getObjectName())
                .putObjectBody(uploadRequest.getInputStream())
                .contentLength(uploadRequest.getFileSize())
                .build();

        try {
            objectStorageClient.putObject(request);
        } catch (BmcException e) {
            throw new UploadServiceException("Failed to upload object " + uploadRequest.getObjectName(), e);
        }
        return true;
    }
}
