package com.murideen.admin;

import com.murideen.admin.dto.BestSellerDto;
import com.murideen.admin.dto.DashboardSummaryDto;
import com.murideen.admin.dto.LowStockDto;
import com.murideen.admin.dto.SalesPointDto;
import com.murideen.order.Order;
import com.murideen.order.OrderRepository;
import com.murideen.order.OrderStatus;
import com.murideen.product.Product;
import com.murideen.product.ProductRepository;
import com.murideen.product.ProductStatus;
import com.murideen.product.ProductVariant;
import com.murideen.product.ProductVariantRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final int SEUIL_STOCK_FAIBLE = 5;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public DashboardService(OrderRepository orderRepository, ProductRepository productRepository,
                             ProductVariantRepository variantRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @Cacheable("dashboardSummary")
    public DashboardSummaryDto summary() {
        Instant startOfToday = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant startOfYesterday = startOfToday.minusSeconds(86400);

        BigDecimal caJour = orderRepository.sumRevenueSince(startOfToday);
        BigDecimal totalHierEtAujourdhui = orderRepository.sumRevenueSince(startOfYesterday);
        BigDecimal caHier = totalHierEtAujourdhui.subtract(caJour);

        BigDecimal variation;
        if (caHier.compareTo(BigDecimal.ZERO) == 0) {
            variation = caJour.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        } else {
            variation = caJour.subtract(caHier).divide(caHier, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP);
        }

        long enAttente = orderRepository.countByStatut(OrderStatus.EN_ATTENTE);
        BigDecimal panierMoyen = orderRepository.averageOrderValue().setScale(0, RoundingMode.HALF_UP);
        long ruptures = variantRepository.countByStock(0);

        return new DashboardSummaryDto(caJour, variation, enAttente, panierMoyen, ruptures);
    }

    public List<SalesPointDto> salesLast7Days() {
        Instant from = LocalDate.now(ZoneOffset.UTC).minusDays(6).atStartOfDay().toInstant(ZoneOffset.UTC);
        List<Order> orders = orderRepository.findAllSince(from);

        Map<LocalDate, List<Order>> byDay = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()));

        return java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(i -> LocalDate.now(ZoneOffset.UTC).minusDays(6 - i))
                .map(day -> {
                    List<Order> dayOrders = byDay.getOrDefault(day, List.of());
                    BigDecimal total = dayOrders.stream()
                            .filter(o -> o.getStatut() != OrderStatus.ANNULEE)
                            .map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new SalesPointDto(day, total, dayOrders.size());
                })
                .toList();
    }

    public List<BestSellerDto> bestSellers() {
        List<Product> products = productRepository.findByStatutOrderByNbVentesDesc(ProductStatus.ACTIF, PageRequest.of(0, 5)).getContent();
        int max = products.stream().mapToInt(Product::getNbVentes).max().orElse(1);
        if (max == 0) max = 1;
        int finalMax = max;
        return products.stream()
                .map(p -> new BestSellerDto(p.getId(), p.getNom(), p.getNbVentes(), (double) p.getNbVentes() / finalMax))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LowStockDto> lowStock() {
        List<ProductVariant> variants = variantRepository.findLowStock(SEUIL_STOCK_FAIBLE);
        return variants.stream()
                .map(v -> new LowStockDto(v.getProduct().getId(), v.getProduct().getNom(), v.getTaille(), v.getCouleur(), v.getStock()))
                .toList();
    }
}
