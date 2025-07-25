package com.torrent.streaming.streaming_service.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Optional;

@Getter
@AllArgsConstructor
public class Movie {
    private long movieId;
    private String name;
    private String year;
    private String videoPath;
    private List<String> subsFiles;
    private Optional<OMDBMovieResponse> omdbData;
}
