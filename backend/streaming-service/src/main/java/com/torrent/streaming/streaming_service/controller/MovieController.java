package com.torrent.streaming.streaming_service.controller;

import com.torrent.streaming.streaming_service.entity.MovieEntity;
import com.torrent.streaming.streaming_service.repository.MovieRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api")
public class MovieController {
    private final MovieRepository movieRepository;

    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @GetMapping("/movies")
    public List<MovieEntity> getAllMovies() {
        return movieRepository.findAll();
    }

    @GetMapping("/movies/{id}")
    public ResponseEntity<MovieEntity> getMovieById(@PathVariable String id) {
        Optional<MovieEntity> optionalMovieEntity = movieRepository.findById(id);
        return optionalMovieEntity.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
