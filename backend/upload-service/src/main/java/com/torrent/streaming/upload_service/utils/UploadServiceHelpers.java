package com.torrent.streaming.upload_service.utils;

import com.torrent.streaming.upload_service.model.FileInfo;
import com.torrent.streaming.upload_service.model.TorrentStatus;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class UploadServiceHelpers {
    private UploadServiceHelpers() {
    }

    // Remove backslashes before common characters that don't need escaping in shell
    public static String sanitizeTorrentUrl(String url) {
        return url.replaceAll("\\\\(?=\\p{Graph})", "");
    }

    public static List<String> getMovieNameAndYear(TorrentStatus status) {
        String folderName = getMovieFolderName(status);
        // Regex explanation:
        // ^(.*?) \\((\\d{4})\\) — matches "<Movie Name> (2025)" part only
        Pattern pattern = Pattern.compile("^(.*?) \\((\\d{4})\\)");
        Matcher matcher = pattern.matcher(folderName);

        if (matcher.find()) {
            String title = matcher.group(1).trim();
            String year = matcher.group(2);
            return List.of(title, year);
        }

        throw new IllegalArgumentException("Invalid movie folder name: " + folderName);
    }

    // Extracts movie folder name from torrent status
    private static String getMovieFolderName(TorrentStatus status) {
        return status.getFiles().getFirst().getPath().split("/")[0];
    }

    public static Optional<String> findFirstPathByExt(List<FileInfo> files, String ext) {
        return getFileInfoStream(files, ext).map(FileInfo::getPath).findFirst();
    }

    public static Optional<Long> findFirstLengthByExt(List<FileInfo> files, String ext) {
        return getFileInfoStream(files, ext).map(FileInfo::getLengthBytes).findFirst();
    }

    private static Stream<FileInfo> getFileInfoStream(List<FileInfo> files, String ext) {
        String lower = ext.toLowerCase();
        return files.stream()
                .filter(f -> f.getName() != null && f.getName()
                        .toLowerCase()
                        .endsWith(lower));
    }
}
