package com.torrent.streaming.upload_service.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileInfo {
    private String name;
    private String path;
    private long lengthBytes;
}
