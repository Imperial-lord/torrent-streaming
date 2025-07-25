package com.torrent.streaming.upload_service.exception;

public class UploadServiceException extends Exception {
    public UploadServiceException(String message) {
        super(message);
    }

    public UploadServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
