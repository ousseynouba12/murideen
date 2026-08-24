package com.murideen.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "murideen.jwt")
public class JwtProperties {
    private String secret;
    private int accessTtlMinutes = 15;
    private int refreshTtlDays = 30;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public int getAccessTtlMinutes() { return accessTtlMinutes; }
    public void setAccessTtlMinutes(int accessTtlMinutes) { this.accessTtlMinutes = accessTtlMinutes; }
    public int getRefreshTtlDays() { return refreshTtlDays; }
    public void setRefreshTtlDays(int refreshTtlDays) { this.refreshTtlDays = refreshTtlDays; }
}
