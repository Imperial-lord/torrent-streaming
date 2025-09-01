package com.torrent.streaming.streaming_service.controller;

import com.torrent.streaming.streaming_service.entity.MovieEntity;
import com.torrent.streaming.streaming_service.repository.MovieRepository;
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
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api")
public class SubtitleController {
    private final MovieRepository movieRepository;
    private final SubtitleService subtitleService;

    @Autowired
    public SubtitleController(MovieRepository movieRepository, SubtitleService subtitleService) {
        this.movieRepository = movieRepository;
        this.subtitleService = subtitleService;
    }

    @GetMapping(value = "/subtitles", produces = "text/vtt; charset=UTF-8")
    public ResponseEntity<InputStreamResource> getSubtitle(@RequestParam String imdbId) {
        Optional<MovieEntity> optionalMovieEntity = movieRepository.findById(imdbId);
        if (optionalMovieEntity.isPresent()) {
            String subtitlesPath = optionalMovieEntity.get().getSubtitlesPath();
            if (subtitlesPath == null) return ResponseEntity.notFound().build();

            InputStream subtitleStream = subtitleService.getSubtitles(subtitlesPath);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("text/vtt"));
            headers.setContentDisposition(ContentDisposition.inline().filename("subtitle.vtt").build());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(subtitleStream));
        }

        return ResponseEntity.notFound().build();
    }
}
