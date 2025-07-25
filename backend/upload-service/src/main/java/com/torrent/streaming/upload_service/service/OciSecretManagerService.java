package com.torrent.streaming.upload_service.service;

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

    @Value("${oci.secret.bucket.ocid}")
    private String bucketNameSecretOcid;
    @Value("${oci.secret.namespace.ocid}")
    private String namespaceSecretOcid;

    public OciSecretManagerService(SecretsClient secretsClient) {
        this.secretsClient = secretsClient;
    }

    @PostConstruct
    public void init() {
        this.namespace = getSecretValue(namespaceSecretOcid);
        this.bucketName = getSecretValue(bucketNameSecretOcid);
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

