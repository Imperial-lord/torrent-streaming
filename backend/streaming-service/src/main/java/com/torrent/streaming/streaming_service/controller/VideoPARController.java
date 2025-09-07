package com.torrent.streaming.streaming_service.controller;

import com.torrent.streaming.streaming_service.service.VideoPARService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class VideoPARController {
    private final VideoPARService videoPARService;

    public VideoPARController(VideoPARService videoPARService) {
        this.videoPARService = videoPARService;
    }

    @GetMapping("/video-url")
    public Map<String, String> getVideoPARUrl(@RequestParam(value = "objectName") String objectName) {
        return Map.of("url", videoPARService.generateParUrl(objectName, 45));
    }
}
