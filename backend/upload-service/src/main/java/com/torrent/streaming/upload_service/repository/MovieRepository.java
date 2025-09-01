package com.torrent.streaming.upload_service.repository;

import com.torrent.streaming.upload_service.entity.MovieEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MovieRepository extends MongoRepository<MovieEntity, String> {
}
