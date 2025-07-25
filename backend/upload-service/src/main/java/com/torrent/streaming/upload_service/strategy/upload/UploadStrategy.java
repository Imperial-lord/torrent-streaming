package com.torrent.streaming.upload_service.strategy.upload;

import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.torrent.streaming.upload_service.exception.UploadServiceException;
import com.torrent.streaming.upload_service.model.OciUploadRequest;
import com.torrent.streaming.upload_service.service.OciSecretManagerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public abstract class UploadStrategy {
    protected final ObjectStorageClient objectStorageClient;
    protected final String namespace;
    protected final String bucketName;

    protected UploadStrategy(ObjectStorageClient objectStorageClient, OciSecretManagerService ociSecretManagerService) {
        this.objectStorageClient = objectStorageClient;
        namespace = ociSecretManagerService.getNamespace();
        bucketName = ociSecretManagerService.getBucketName();
    }

    public abstract Boolean upload(OciUploadRequest uploadRequest) throws UploadServiceException;
}
