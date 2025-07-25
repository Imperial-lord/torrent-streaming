package com.torrent.streaming.streaming_service.config;

import com.oracle.bmc.auth.BasicAuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.secrets.SecretsClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class OciConfig {
    private static final String OCI_CONFIG_PATH = "~/.oci/config";
    private static final String OCI_CONFIG_PROFILE = "DEFAULT";

    @Bean
    public BasicAuthenticationDetailsProvider authProvider() throws IOException {
        return new ConfigFileAuthenticationDetailsProvider(OCI_CONFIG_PATH, OCI_CONFIG_PROFILE);
    }

    @Bean
    public ObjectStorageClient objectStorageClient(BasicAuthenticationDetailsProvider authProvider) {
        return ObjectStorageClient.builder().build(authProvider);
    }

    @Bean
    public SecretsClient secretsClient(BasicAuthenticationDetailsProvider authProvider) {
        return SecretsClient.builder().build(authProvider);
    }
}
