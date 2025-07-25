package com.torrent.streaming.streaming_service.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.torrent.streaming.streaming_service.model.OMDBMovieResponse;

public class MovieMapper {
    private static final ObjectMapper mapper = new ObjectMapper();

    private MovieMapper() {
    }

    public static String toJson(OMDBMovieResponse omdb) {
        try {
            return mapper.writeValueAsString(omdb);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize OMDBMovieResponse", e);
        }
    }

    public static OMDBMovieResponse fromJson(String json) {
        try {
            return mapper.readValue(json, OMDBMovieResponse.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize OMDBMovieResponse", e);
        }
    }
}
