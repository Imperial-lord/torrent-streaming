package com.torrent.streaming.streaming_service.service;

import com.oracle.bmc.secrets.SecretsClient;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import static com.torrent.streaming.streaming_service.utils.OciSecretHelper.getSecretValue;

@Service
public class OciSecretManagerService {
    private final SecretsClient secretsClient;

    @Getter
    private String bucketName;
    @Getter
    private String namespace;
    @Getter
    private String omdbApiKey;
    @Getter
    private String tmdbReadAccessToken;

    @Value("${oci.secret.bucket.ocid}")
    private String bucketNameSecretOcid;
    @Value("${oci.secret.namespace.ocid}")
    private String namespaceSecretOcid;
    @Value("${oci.secret.omdb.api.key.ocid}")
    private String omdbApiKeyOcid;
    @Value("${oci.secret.tmdb.acces.token.ocid}")
    private String tmdbReadAccessTokenOcid;

    public OciSecretManagerService(SecretsClient secretsClient) {
        this.secretsClient = secretsClient;
    }

    @PostConstruct
    public void init() {
        this.namespace = getSecretValue(secretsClient, namespaceSecretOcid);
        this.bucketName = getSecretValue(secretsClient, bucketNameSecretOcid);
        this.omdbApiKey = getSecretValue(secretsClient, omdbApiKeyOcid);
        this.tmdbReadAccessToken = getSecretValue(secretsClient, tmdbReadAccessTokenOcid);
    }

    @PreDestroy
    public void close() {
        secretsClient.close();
    }
}

