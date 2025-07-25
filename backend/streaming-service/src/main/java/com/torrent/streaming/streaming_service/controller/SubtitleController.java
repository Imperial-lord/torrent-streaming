package com.torrent.streaming.streaming_service.controller;

import com.torrent.streaming.streaming_service.service.SubtitleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;

@Slf4j
@RestController
@RequestMapping("/api")
public class SubtitleController {

    private final SubtitleService subtitleService;

    @Autowired
    public SubtitleController(SubtitleService subtitleService) {
        this.subtitleService = subtitleService;
    }

    @GetMapping("/subtitles")
    public ResponseEntity<InputStreamResource> getSubtitle(@RequestParam String objectName) {
        InputStream subtitleStream = subtitleService.getSubtitles(objectName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("text/vtt"));
        headers.setContentDisposition(ContentDisposition.inline().filename("subtitle.vtt").build());
    
        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(subtitleStream));
    }
}
