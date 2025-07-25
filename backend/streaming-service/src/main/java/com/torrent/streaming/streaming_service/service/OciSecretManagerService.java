package com.torrent.streaming.streaming_service.service;

import com.oracle.bmc.secrets.SecretsClient;
import com.oracle.bmc.secrets.model.Base64SecretBundleContentDetails;
import com.oracle.bmc.secrets.requests.GetSecretBundleRequest;
import com.oracle.bmc.secrets.responses.GetSecretBundleResponse;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;

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
        this.namespace = getSecretValue(namespaceSecretOcid);
        this.bucketName = getSecretValue(bucketNameSecretOcid);
        this.omdbApiKey = getSecretValue(omdbApiKeyOcid);
        this.tmdbReadAccessToken = getSecretValue(tmdbReadAccessTokenOcid);
    }

    private String getSecretValue(String secretOcid) {
        GetSecretBundleResponse response = secretsClient.getSecretBundle(
                GetSecretBundleRequest.builder()
                        .secretId(secretOcid)
                        .build());

        Base64SecretBundleContentDetails content = (Base64SecretBundleContentDetails) response.getSecretBundle().getSecretBundleContent();
        return new String(Base64.getDecoder().decode(content.getContent()));
    }

    @PreDestroy
    public void close() {
        secretsClient.close();
    }
}

