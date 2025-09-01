package com.torrent.streaming.upload_service.entity;

import com.torrent.streaming.upload_service.model.OmdbResponse;
import com.torrent.streaming.upload_service.model.TmdbImageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "movie")
@Getter
@Setter
@Builder
public class MovieEntity {
    @Id
    private String imdbId; // saved as _id in the DB
    @Valid
    private OmdbResponse omdbResponse;
    @Valid
    private TmdbImageResponse tmdbImageResponse;
    @NotBlank
    @Indexed
    private String videoPath;
    @NotNull
    @Positive
    private Long videoBytes;
    private String subtitlesPath;
    @PositiveOrZero
    private Long subtitlesBytes;
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
}
