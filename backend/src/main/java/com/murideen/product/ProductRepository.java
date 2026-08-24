package com.murideen.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlugAndStatut(String slug, ProductStatus statut);

    Optional<Product> findBySlug(String slug);

    @Query("""
            SELECT p FROM Product p
            WHERE p.statut = :statut
            AND (:categorySlug IS NULL OR p.category.slug = CAST(:categorySlug AS string))
            AND (:search IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            """)
    Page<Product> search(@Param("statut") ProductStatus statut,
                          @Param("categorySlug") String categorySlug,
                          @Param("search") String search,
                          Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE (:categorySlug IS NULL OR p.category.slug = CAST(:categorySlug AS string))
            AND (:search IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            """)
    Page<Product> searchAdmin(@Param("categorySlug") String categorySlug,
                               @Param("search") String search,
                               Pageable pageable);

    Page<Product> findByStatutOrderByNbVentesDesc(ProductStatus statut, Pageable pageable);
}
