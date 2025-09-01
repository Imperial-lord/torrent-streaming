package com.torrent.streaming.streaming_service.controller;

import com.oracle.bmc.objectstorage.responses.GetObjectResponse;
import com.torrent.streaming.streaming_service.service.VideoPARService;
import com.torrent.streaming.streaming_service.service.VideoService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class VideoController {
    private final VideoService videoService;
    private final VideoPARService videoPARService;

    public VideoController(VideoService videoService, VideoPARService videoPARService) {
        this.videoService = videoService;
        this.videoPARService = videoPARService;
    }

    @GetMapping("/video")
    public void getVideoStream(
            @RequestParam(value = "objectName") String objectName,
            @RequestHeader(value = "Range", required = false) String range,
            HttpServletResponse response) throws IOException {
        GetObjectResponse getObjectResponse = videoService.streamVideo(objectName, range, response);

        try (InputStream is = getObjectResponse.getInputStream();
             OutputStream os = response.getOutputStream()) {
            is.transferTo(os);  // Stream directly
            os.flush();
        }
    }

    @GetMapping("/video-url")
    public Map<String, String> getVideoPARUrl(@RequestParam(value = "objectName") String objectName) {
        return Map.of("url", videoPARService.generateParUrl(objectName, 45));
    }
}
