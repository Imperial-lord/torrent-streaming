package com.torrent.streaming.streaming_service.repository;

import com.torrent.streaming.streaming_service.entity.MovieEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MovieRepository extends JpaRepository<MovieEntity, Long> {
    Optional<MovieEntity> findByNameAndReleaseYear(String name, String year);
}