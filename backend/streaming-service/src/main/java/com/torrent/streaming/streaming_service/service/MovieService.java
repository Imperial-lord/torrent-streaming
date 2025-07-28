package com.torrent.streaming.streaming_service.service;

import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.model.ObjectSummary;
import com.oracle.bmc.objectstorage.requests.ListObjectsRequest;
import com.oracle.bmc.objectstorage.responses.ListObjectsResponse;
import com.torrent.streaming.streaming_service.client.OMDBClient;
import com.torrent.streaming.streaming_service.client.TMDBClient;
import com.torrent.streaming.streaming_service.entity.MovieEntity;
import com.torrent.streaming.streaming_service.model.Movie;
import com.torrent.streaming.streaming_service.model.OMDBMovieResponse;
import com.torrent.streaming.streaming_service.repository.MovieRepository;
import com.torrent.streaming.streaming_service.utils.MovieMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MovieService {
    private final ObjectStorageClient objectStorageClient;
    private final OMDBClient omdbClient;
    private final TMDBClient tmdbClient;
    private final MovieRepository movieRepository;
    private final String namespace;
    private final String bucketName;

    public MovieService(ObjectStorageClient objectStorageClient, OciSecretManagerService ociSecretManagerService, OMDBClient omdbClient, TMDBClient tmdbClient, MovieRepository movieRepository) {
        this.objectStorageClient = objectStorageClient;
        this.omdbClient = omdbClient;
        this.tmdbClient = tmdbClient;
        this.movieRepository = movieRepository;
        this.namespace = ociSecretManagerService.getNamespace();
        this.bucketName = ociSecretManagerService.getBucketName();
    }

    public List<Movie> listAllMovies() {
        List<String> objects = listObjectsInBucket();
        Map<String, List<String>> groupedByMovie = objects.stream()
                .collect(Collectors.groupingBy(obj -> obj.split("/")[0]));

        List<Movie> movies = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : groupedByMovie.entrySet()) {
            String folderName = entry.getKey();
            List<String> files = entry.getValue();

            MovieNameYear movieTitleYear = extractMovieNameAndYear(folderName);
            Optional<String> videoFile = files.stream()
                    .filter(name -> name.endsWith(".mp4"))
                    .findFirst();
            List<String> subsFiles = files.stream()
                    .filter(name -> name.endsWith(".srt"))
                    .toList();
            videoFile.ifPresent(videoPath -> {
                Optional<MovieEntity> dbEntry = movieRepository.findByNameAndReleaseYear(movieTitleYear.name(), movieTitleYear.year());
                AtomicLong movieId = new AtomicLong();
                dbEntry.ifPresent(movieEntity -> movieId.set(movieEntity.getId()));
                OMDBMovieResponse omdbData = dbEntry.map(entity -> MovieMapper.fromJson(entity.getOmdbJson()))
                        .orElseGet(() -> {
                            Optional<OMDBMovieResponse> fetched = omdbClient.fetchMovieDetails(movieTitleYear.name(), movieTitleYear.year());

                            if (fetched.isPresent()) {
                                OMDBMovieResponse omdb = fetched.get();

                                // Try fetching high-res poster from TMDB
                                tmdbClient.fetchHighResPoster(omdb.getImdbID()).ifPresent(omdb::setPoster);

                                // Persist into DB
                                MovieEntity newEntity = MovieEntity.builder()
                                        .name(movieTitleYear.name())
                                        .releaseYear(movieTitleYear.year())
                                        .imdbId(omdb.getImdbID())
                                        .omdbJson(MovieMapper.toJson(omdb))
                                        .build();

                                movieId.set(movieRepository.save(newEntity).getId());
                                return omdb;
                            }

                            return null;
                        });

                if (omdbData != null) {
                    movies.add(new Movie(movieId.get(), movieTitleYear.name(), movieTitleYear.year(), videoPath, subsFiles, Optional.of(omdbData)));
                }
            });
        }

        return movies;
    }

    private MovieNameYear extractMovieNameAndYear(String folderName) {
        // Regex explanation:
        // ^(.*?) \\((\\d{4})\\) — matches "<Movie Name> (2025)" part only
        Pattern pattern = Pattern.compile("^(.*?) \\((\\d{4})\\)");
        Matcher matcher = pattern.matcher(folderName);

        if (matcher.find()) {
            String name = matcher.group(1).trim();
            String year = matcher.group(2);
            return new MovieNameYear(name, year);
        }

        throw new IllegalArgumentException("Invalid movie folder name: " + folderName);
    }

    private List<String> listObjectsInBucket() {
        ListObjectsRequest request = ListObjectsRequest.builder()
                .namespaceName(namespace)
                .bucketName(bucketName)
                .build();

        ListObjectsResponse response = objectStorageClient.listObjects(request);
        return response.getListObjects().getObjects()
                .stream()
                .map(ObjectSummary::getName)
                .toList();
    }

    private record MovieNameYear(String name, String year) {
    }
}
