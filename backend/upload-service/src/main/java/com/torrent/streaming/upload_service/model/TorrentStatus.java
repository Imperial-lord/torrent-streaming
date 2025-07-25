package com.torrent.streaming.upload_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TorrentStatus {
    private String name;
    private int progress;
    private long downloadedBytes;
    @JsonProperty("isDownloading")
    private boolean isDownloading;
    @JsonProperty("isDone")
    private boolean isDone;
    private String downloadPath;
    private List<FileInfo> files;
    private long startTime;
    private long durationSeconds;
}
