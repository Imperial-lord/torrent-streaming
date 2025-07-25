package com.torrent.streaming.streaming_service.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.torrent.streaming.streaming_service.service.OciSecretManagerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

@Component
@Slf4j
public class TMDBClient {
    private static final String TMDB_FIND_URL = "https://api.themoviedb.org/3/find/";
    private static final String IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiReadAccessToken;

    public TMDBClient(OciSecretManagerService ociSecretManagerService) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.apiReadAccessToken = ociSecretManagerService.getTmdbReadAccessToken();
    }

    public Optional<String> fetchHighResPoster(String imdbId) {
        try {
            String url = String.format("%s/%s?external_source=imdb_id", TMDB_FIND_URL, imdbId);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", String.format("Bearer %s", apiReadAccessToken))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode movieResults = root.path("movie_results");

                if (movieResults.isArray() && !movieResults.isEmpty()) {
                    JsonNode firstResult = movieResults.get(0);
                    JsonNode posterPathNode = firstResult.path("poster_path");

                    if (!posterPathNode.isMissingNode() && !posterPathNode.isNull()) {
                        return Optional.of(IMAGE_BASE_URL + posterPathNode.asText());
                    }
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
