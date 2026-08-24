package com.murideen.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.murideen.admin.dto.DashboardSummaryDto;
import com.murideen.product.dto.CategoryDto;
import com.murideen.product.dto.ProductDto;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Chaque cache Redis est associé à un sérialiseur Jackson typé explicitement pour la forme
 * exacte de donnée qu'il contient (au lieu du typage polymorphe générique de
 * GenericJackson2JsonRedisSerializer, dont le format d'encodage varie selon le type runtime
 * exact de la collection renvoyée — source de bugs de désérialisation difficiles à diagnostiquer).
 */
@Configuration
public class RedisConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper mapper = JsonMapper.builder().build();

        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()));

        RedisCacheConfiguration categoriesConfig = base.entryTtl(Duration.ofMinutes(15))
                .serializeValuesWith(valuePair(mapper, mapper.getTypeFactory()
                        .constructCollectionType(List.class, CategoryDto.class)));

        RedisCacheConfiguration bestSellersConfig = base.entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(valuePair(mapper, mapper.getTypeFactory()
                        .constructCollectionType(List.class, ProductDto.class)));

        RedisCacheConfiguration dashboardSummaryConfig = base.entryTtl(Duration.ofMinutes(5))
                .serializeValuesWith(valuePair(mapper, mapper.getTypeFactory()
                        .constructType(DashboardSummaryDto.class)));

        Map<String, RedisCacheConfiguration> perCache = Map.of(
                "categories", categoriesConfig,
                "bestSellers", bestSellersConfig,
                "dashboardSummary", dashboardSummaryConfig
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(base.entryTtl(Duration.ofMinutes(10)))
                .withInitialCacheConfigurations(perCache)
                .build();
    }

    private RedisSerializationContext.SerializationPair<Object> valuePair(
            ObjectMapper mapper, com.fasterxml.jackson.databind.JavaType type) {
        @SuppressWarnings({"unchecked", "rawtypes"})
        Jackson2JsonRedisSerializer<Object> serializer =
                (Jackson2JsonRedisSerializer) new Jackson2JsonRedisSerializer<>(mapper, type);
        return RedisSerializationContext.SerializationPair.fromSerializer(serializer);
    }
}
