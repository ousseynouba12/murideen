package com.murideen.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByNumero(String numero);

    @Query("SELECT o FROM Order o WHERE (:statut IS NULL OR o.statut = :statut) ORDER BY o.createdAt DESC")
    Page<Order> findByStatutOptional(@Param("statut") OrderStatus statut, Pageable pageable);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByStatut(OrderStatus statut);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.createdAt >= :from AND o.statut <> 'ANNULEE'")
    BigDecimal sumRevenueSince(@Param("from") Instant from);

    @Query("SELECT COALESCE(AVG(o.total), 0) FROM Order o WHERE o.statut <> 'ANNULEE'")
    BigDecimal averageOrderValue();

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :from ORDER BY o.createdAt ASC")
    List<Order> findAllSince(@Param("from") Instant from);

    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.user.id = :userId AND o.statut <> 'ANNULEE'")
    BigDecimal sumTotalByUser(@Param("userId") Long userId);
}
