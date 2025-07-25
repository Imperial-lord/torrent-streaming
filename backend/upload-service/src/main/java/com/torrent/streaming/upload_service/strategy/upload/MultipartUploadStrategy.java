package com.torrent.streaming.upload_service.strategy.upload;

import com.oracle.bmc.model.BmcException;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.model.CommitMultipartUploadDetails;
import com.oracle.bmc.objectstorage.model.CommitMultipartUploadPartDetails;
import com.oracle.bmc.objectstorage.model.CreateMultipartUploadDetails;
import com.oracle.bmc.objectstorage.requests.CommitMultipartUploadRequest;
import com.oracle.bmc.objectstorage.requests.CreateMultipartUploadRequest;
import com.oracle.bmc.objectstorage.requests.UploadPartRequest;
import com.oracle.bmc.objectstorage.responses.CreateMultipartUploadResponse;
import com.oracle.bmc.objectstorage.responses.UploadPartResponse;
import com.torrent.streaming.upload_service.exception.UploadServiceException;
import com.torrent.streaming.upload_service.model.OciUploadRequest;
import com.torrent.streaming.upload_service.service.OciSecretManagerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;

import static com.torrent.streaming.upload_service.constant.AppConstants.MAX_CONCURRENCY;
import static com.torrent.streaming.upload_service.constant.AppConstants.PART_SIZE;

@Component
@Slf4j
public class MultipartUploadStrategy extends UploadStrategy {
    protected MultipartUploadStrategy(ObjectStorageClient objectStorageClient, OciSecretManagerService ociSecretManagerService) {
        super(objectStorageClient, ociSecretManagerService);
    }

    /**
     * Saves a large object to Oracle Cloud Infrastructure Object Storage using a
     * multipart upload. This method is designed for large objects that exceed the
     * maximum size allowed for a single put object request.
     * <p>
     * The process involves three main steps:
     * 1. Initiating a multipart upload.
     * 2. Uploading parts of the object.
     * 3. Committing the multipart upload.
     *
     * @param uploadRequest the request containing the object details and input stream
     * @return the true/false after committing the multipart upload
     * @throws UploadServiceException if an I/O error occurs while reading the input stream
     */
    @Override
    public Boolean upload(OciUploadRequest uploadRequest) throws UploadServiceException {
        CreateMultipartUploadResponse initiateResponse;

        // Step 1: Initiate multipart upload
        try {
            initiateResponse = initiateMultipartUpload(uploadRequest);
        } catch (BmcException e) {
            throw new UploadServiceException("Failed to upload object " + uploadRequest.getObjectName(), e);
        }

        // Step 2: Upload parts
        String uploadId = initiateResponse.getMultipartUpload().getUploadId();
        List<UploadPartResponse> partResponses = new ArrayList<>();
        createAndUploadParts(uploadRequest, partResponses, uploadId);

        // Step 3: Commit upload
        commitUpload(partResponses, uploadRequest, uploadId);

        return true;
    }

    private CreateMultipartUploadResponse initiateMultipartUpload(OciUploadRequest uploadRequest) {
        return objectStorageClient.createMultipartUpload(
                CreateMultipartUploadRequest.builder()
                        .namespaceName(namespace)
                        .bucketName(bucketName)
                        .createMultipartUploadDetails(
                                CreateMultipartUploadDetails.builder()
                                        .object(uploadRequest.getObjectName())
                                        .build()
                        )
                        .build()
        );
    }

    private void createAndUploadParts(OciUploadRequest uploadRequest,
                                      List<UploadPartResponse> partResponses,
                                      String uploadId) throws UploadServiceException {
        long fileSize = uploadRequest.getFileSize();

        try (ExecutorService executor = Executors.newThreadPerTaskExecutor(
                Thread.ofVirtual()
                        .name("virtual-", 0)
                        .factory()
        )) {
            Semaphore semaphore = new Semaphore(MAX_CONCURRENCY);
            List<Future<UploadPartResponse>> futures = new ArrayList<>();
            final long[] totalUploadedBytes = {0};

            try (InputStream input = uploadRequest.getInputStream()) {
                byte[] buffer = new byte[PART_SIZE];
                int bytesRead;
                int partNum = 1;

                while ((bytesRead = input.read(buffer)) > 0) {
                    semaphore.acquireUninterruptibly();

                    final int thisPart = partNum++;
                    byte[] partData = Arrays.copyOf(buffer, bytesRead);

                    futures.add(executor.submit(() -> {
                        try {
                            UploadPartRequest upr = UploadPartRequest.builder()
                                    .namespaceName(namespace)
                                    .bucketName(bucketName)
                                    .objectName(uploadRequest.getObjectName())
                                    .uploadId(uploadId)
                                    .uploadPartNum(thisPart)
                                    .contentLength((long) partData.length)
                                    .uploadPartBody(new ByteArrayInputStream(partData))
                                    .build();

                            UploadPartResponse resp = objectStorageClient.uploadPart(upr);

                            synchronized (log) {
                                totalUploadedBytes[0] += partData.length;
                                double pct = 100.0 * totalUploadedBytes[0] / fileSize;
                                log.info("⏳ Progress: {}%, Uploaded part {}: {} bytes",
                                        String.format("%.2f", pct),
                                        thisPart,
                                        partData.length
                                );
                            }
                            return resp;
                        } finally {
                            // free up a slot so the reader can submit the next chunk
                            semaphore.release();
                        }
                    }));
                }
            } catch (IOException e) {
                throw new UploadServiceException(e.getMessage(), e);
            }

            for (Future<UploadPartResponse> future : futures) {
                try {
                    partResponses.add(future.get());
                } catch (InterruptedException | ExecutionException e) {
                    executor.shutdownNow();
                    Thread.currentThread().interrupt();
                    throw new UploadServiceException("Failed to upload part", e);
                }
            }
            executor.shutdown();
        }
    }

    private void commitUpload(List<UploadPartResponse> partResponses, OciUploadRequest uploadRequest, String uploadId) {
        List<CommitMultipartUploadPartDetails> parts = new ArrayList<>();
        int partNumber = 1;
        for (UploadPartResponse response : partResponses) {
            parts.add(
                    CommitMultipartUploadPartDetails.builder()
                            .etag(response.getETag())
                            .partNum(partNumber++)
                            .build()
            );
        }

        objectStorageClient.commitMultipartUpload(
                CommitMultipartUploadRequest.builder()
                        .namespaceName(namespace)
                        .bucketName(bucketName)
                        .objectName(uploadRequest.getObjectName())
                        .uploadId(uploadId)
                        .commitMultipartUploadDetails(
                                CommitMultipartUploadDetails.builder()
                                        .partsToCommit(parts)
                                        .build()
                        )
                        .build()
        );
    }
}
