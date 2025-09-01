package com.torrent.streaming.upload_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.mapping.event.ValidatingEntityCallback;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    @Bean
    public LocalValidatorFactoryBean validatorFactoryBean() {
        return new LocalValidatorFactoryBean();
    }

    @Bean
    public ValidatingEntityCallback validatingMongoEventListener(LocalValidatorFactoryBean validatorFactoryBean) {
        return new ValidatingEntityCallback(validatorFactoryBean);
    }
}
