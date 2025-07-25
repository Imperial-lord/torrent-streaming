package com.torrent.streaming.upload_service.constant;

public class AppConstants {
    public static final int PART_SIZE_MB = 32;
    public static final int PART_SIZE = PART_SIZE_MB * 1024 * 1024; // 32 MB in bytes
    public static final int MAX_CONCURRENCY = 40;
}
