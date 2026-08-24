package com.murideen.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Query("SELECT v FROM ProductVariant v WHERE v.stock <= :seuil ORDER BY v.stock ASC")
    List<ProductVariant> findLowStock(int seuil);

    long countByStock(int stock);
}
