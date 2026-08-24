package com.murideen.admin;

import com.murideen.admin.dto.CustomerDto;
import com.murideen.order.OrderRepository;
import com.murideen.user.Role;
import com.murideen.user.User;
import com.murideen.user.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasAnyRole('PROPRIETAIRE', 'GESTIONNAIRE')")
public class AdminCustomerController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminCustomerController(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public List<CustomerDto> list() {
        return userRepository.findByRole(Role.CLIENT, PageRequest.of(0, 200)).stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping(value = "/export.csv", produces = "text/csv")
    public void exportCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"clients-murideen.csv\"");
        try (PrintWriter writer = response.getWriter()) {
            writer.println("Nom,Email,Telephone,Nombre de commandes,Total depense (FCFA)");
            for (CustomerDto c : list()) {
                writer.printf("%s,%s,%s,%d,%s%n", escape(c.nom()), escape(c.email()), escape(c.telephone()),
                        c.nombreCommandes(), c.totalDepense().toPlainString());
            }
        }
    }

    private CustomerDto toDto(User user) {
        long nb = orderRepository.countByUserId(user.getId());
        var total = orderRepository.sumTotalByUser(user.getId());
        return new CustomerDto(user.getId(), user.getNom(), user.getEmail(), user.getTelephone(), nb, total);
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace(",", " ");
    }
}
