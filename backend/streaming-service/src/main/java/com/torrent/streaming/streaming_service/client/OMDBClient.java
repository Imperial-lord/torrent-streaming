package com.torrent.streaming.streaming_service.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.torrent.streaming.streaming_service.model.OMDBMovieResponse;
import com.torrent.streaming.streaming_service.service.OciSecretManagerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Component
public class OMDBClient {
    private static final String BASE_URL = "http://www.omdbapi.com/";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public OMDBClient(OciSecretManagerService ociSecretManagerService) {
        this.apiKey = ociSecretManagerService.getOmdbApiKey();
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public Optional<OMDBMovieResponse> fetchMovieDetails(String title, String year) {
        try {
            String encodedTitle = URLEncoder.encode(title, StandardCharsets.UTF_8);
            String url = String.format("%s?apikey=%s&t=%s&y=%s", BASE_URL, apiKey, encodedTitle, year);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                OMDBMovieResponse movie = objectMapper.readValue(response.body(), OMDBMovieResponse.class);
                if ("True".equalsIgnoreCase(movie.getResponse())) {
                    return Optional.of(movie);
                }
            }
        } catch (IOException | InterruptedException e) {
            log.error("An exception occurred while connecting to open movie DB", e);
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
        }

        return Optional.empty();
    }
}
