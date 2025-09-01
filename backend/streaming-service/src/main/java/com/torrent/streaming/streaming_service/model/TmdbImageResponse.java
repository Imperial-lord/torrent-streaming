package com.torrent.streaming.streaming_service.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TmdbImageResponse {
    private String posterImageUrl;
    private String backdropImageUrl;
}
