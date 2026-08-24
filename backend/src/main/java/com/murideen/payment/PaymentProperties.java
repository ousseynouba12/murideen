package com.murideen.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "murideen.payment")
public class PaymentProperties {

    private String provider = "CINETPAY";
    private CinetPay cinetpay = new CinetPay();
    private PayDunya paydunya = new PayDunya();

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public CinetPay getCinetpay() { return cinetpay; }
    public void setCinetpay(CinetPay cinetpay) { this.cinetpay = cinetpay; }
    public PayDunya getPaydunya() { return paydunya; }
    public void setPaydunya(PayDunya paydunya) { this.paydunya = paydunya; }

    public static class CinetPay {
        private String apiKey;
        private String siteId;
        private String secretKey;
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getSiteId() { return siteId; }
        public void setSiteId(String siteId) { this.siteId = siteId; }
        public String getSecretKey() { return secretKey; }
        public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    }

    public static class PayDunya {
        private String masterKey;
        private String privateKey;
        private String publicKey;
        private String token;
        public String getMasterKey() { return masterKey; }
        public void setMasterKey(String masterKey) { this.masterKey = masterKey; }
        public String getPrivateKey() { return privateKey; }
        public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }
        public String getPublicKey() { return publicKey; }
        public void setPublicKey(String publicKey) { this.publicKey = publicKey; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
