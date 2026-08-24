package com.murideen.settings;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryZoneRepository extends JpaRepository<DeliveryZone, Long> {
    Optional<DeliveryZone> findFirstByNomIgnoreCase(String nom);
}
