package com.torrent.streaming.upload_service;

import com.torrent.streaming.upload_service.service.TorrentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class UploadServiceApplication implements CommandLineRunner {

    private final TorrentService torrentService;

    @Autowired
    public UploadServiceApplication(TorrentService torrentService) {
        this.torrentService = torrentService;
    }

    public static void main(String[] args) {
        SpringApplication.run(UploadServiceApplication.class, args);
    }

    @Override
    public void run(String... args) {
        String torrentUrl = getTorrentUrl(args);
        try {
            torrentService.orchestrateTorrentUpload(torrentUrl);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
        System.exit(0);
    }

    private String getTorrentUrl(String... args) {
        if (args.length == 0) {
            log.error("Torrent URL must be passed as the first argument.");
            System.exit(1);
        }

        return args[0];
    }
}
