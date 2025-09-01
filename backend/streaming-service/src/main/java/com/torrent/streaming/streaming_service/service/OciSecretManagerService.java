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

    @Value("${oci.secret.bucket.ocid}")
    private String bucketNameSecretOcid;
    @Value("${oci.secret.namespace.ocid}")
    private String namespaceSecretOcid;

    public OciSecretManagerService(SecretsClient secretsClient) {
        this.secretsClient = secretsClient;
    }

    @PostConstruct
    public void init() {
        this.namespace = getSecretValue(secretsClient, namespaceSecretOcid);
        this.bucketName = getSecretValue(secretsClient, bucketNameSecretOcid);
    }

    @PreDestroy
    public void close() {
        secretsClient.close();
    }
}

