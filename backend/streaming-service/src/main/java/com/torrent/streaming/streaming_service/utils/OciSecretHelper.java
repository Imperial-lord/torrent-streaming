package com.torrent.streaming.streaming_service.utils;

import com.oracle.bmc.secrets.SecretsClient;
import com.oracle.bmc.secrets.model.Base64SecretBundleContentDetails;
import com.oracle.bmc.secrets.requests.GetSecretBundleRequest;
import com.oracle.bmc.secrets.responses.GetSecretBundleResponse;

import java.util.Base64;

public class OciSecretHelper {
    private OciSecretHelper() {
    }

    public static String getSecretValue(SecretsClient secretsClient, String secretOcid) {
        GetSecretBundleResponse response = secretsClient.getSecretBundle(
                GetSecretBundleRequest.builder()
                        .secretId(secretOcid)
                        .build());

        Base64SecretBundleContentDetails content = (Base64SecretBundleContentDetails) response.getSecretBundle().getSecretBundleContent();
        return new String(Base64.getDecoder().decode(content.getContent()));
    }
}
