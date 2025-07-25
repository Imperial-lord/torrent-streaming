package com.torrent.streaming.upload_service.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.InputStream;

@Getter
@Setter
@Builder
public class OciUploadRequest {
    private long fileSize;
    private String objectName;
    private InputStream inputStream;
}
