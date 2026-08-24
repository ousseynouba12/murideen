package com.murideen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import com.murideen.config.JwtProperties;
import com.murideen.payment.PaymentProperties;
import com.murideen.storage.StorageProperties;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableConfigurationProperties({JwtProperties.class, PaymentProperties.class, StorageProperties.class})
public class MurideenApplication {
    public static void main(String[] args) {
        SpringApplication.run(MurideenApplication.class, args);
    }
}
