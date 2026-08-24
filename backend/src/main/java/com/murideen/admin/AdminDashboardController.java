package com.murideen.admin;

import com.murideen.admin.dto.BestSellerDto;
import com.murideen.admin.dto.DashboardSummaryDto;
import com.murideen.admin.dto.LowStockDto;
import com.murideen.admin.dto.SalesPointDto;
import com.murideen.order.OrderService;
import com.murideen.order.dto.OrderDto;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasAnyRole('PROPRIETAIRE', 'GESTIONNAIRE')")
public class AdminDashboardController {

    private final DashboardService dashboardService;
    private final OrderService orderService;

    public AdminDashboardController(DashboardService dashboardService, OrderService orderService) {
        this.dashboardService = dashboardService;
        this.orderService = orderService;
    }

    @GetMapping("/summary")
    public DashboardSummaryDto summary() {
        return dashboardService.summary();
    }

    @GetMapping("/sales")
    public List<SalesPointDto> sales() {
        return dashboardService.salesLast7Days();
    }

    @GetMapping("/best-sellers")
    public List<BestSellerDto> bestSellers() {
        return dashboardService.bestSellers();
    }

    @GetMapping("/low-stock")
    public List<LowStockDto> lowStock() {
        return dashboardService.lowStock();
    }

    @GetMapping("/recent-orders")
    public Page<OrderDto> recentOrders() {
        return orderService.listAdmin(null, 0, 8);
    }
}
