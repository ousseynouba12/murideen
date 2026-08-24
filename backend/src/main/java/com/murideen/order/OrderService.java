package com.murideen.order;

import com.murideen.cart.Cart;
import com.murideen.cart.CartItem;
import com.murideen.cart.CartItemRepository;
import com.murideen.cart.CartRepository;
import com.murideen.common.ApiException;
import com.murideen.notification.NotificationDispatcher;
import com.murideen.order.dto.CheckoutRequest;
import com.murideen.order.dto.CheckoutResponse;
import com.murideen.order.dto.OrderDto;
import com.murideen.payment.PaymentService;
import com.murideen.product.Product;
import com.murideen.product.ProductRepository;
import com.murideen.product.ProductVariant;
import com.murideen.promotion.Promotion;
import com.murideen.promotion.PromotionType;
import com.murideen.settings.SettingsService;
import com.murideen.user.User;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final PaymentService paymentService;
    private final SettingsService settingsService;
    private final NotificationDispatcher notificationDispatcher;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository,
                         CartItemRepository cartItemRepository, ProductRepository productRepository,
                         PaymentService paymentService, SettingsService settingsService,
                         NotificationDispatcher notificationDispatcher) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.paymentService = paymentService;
        this.settingsService = settingsService;
        this.notificationDispatcher = notificationDispatcher;
    }

    @Transactional
    public CheckoutResponse checkout(User user, String cartSessionToken, CheckoutRequest request) {
        Cart cart = resolveExistingCart(user, cartSessionToken);
        if (cart.getItems().isEmpty()) {
            throw ApiException.badRequest("Le panier est vide.");
        }

        PaymentMode mode;
        try {
            mode = PaymentMode.valueOf(request.modePaiement());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Mode de paiement invalide.");
        }

        BigDecimal sousTotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            ProductVariant variant = item.getProductVariant();
            if (variant.getStock() < item.getQuantite()) {
                throw ApiException.badRequest("Stock insuffisant pour \"" + variant.getProduct().getNom() + "\".");
            }
            sousTotal = sousTotal.add(variant.getProduct().getPrix().multiply(BigDecimal.valueOf(item.getQuantite())));
        }

        BigDecimal remise = BigDecimal.ZERO;
        Promotion promotion = cart.getPromotion();
        boolean livraisonOfferte = false;
        if (promotion != null && promotion.estValideMaintenant()) {
            if (promotion.getType() == PromotionType.POURCENTAGE) {
                remise = sousTotal.multiply(promotion.getValeur()).divide(BigDecimal.valueOf(100));
            } else if (promotion.getType() == PromotionType.MONTANT_FIXE) {
                remise = promotion.getValeur().min(sousTotal);
            } else if (promotion.getType() == PromotionType.LIVRAISON_OFFERTE) {
                livraisonOfferte = true;
            }
        }

        BigDecimal apresRemise = sousTotal.subtract(remise);
        BigDecimal livraison = livraisonOfferte
                ? BigDecimal.ZERO
                : settingsService.computeDeliveryFee(request.ville(), apresRemise);

        BigDecimal total = apresRemise.add(livraison);

        Order order = new Order();
        order.setNumero(generateNumero());
        order.setUser(user);
        order.setStatut(OrderStatus.EN_ATTENTE);
        order.setModePaiement(mode);
        order.setSousTotal(sousTotal);
        order.setLivraison(livraison);
        order.setRemise(remise);
        order.setTotal(total);
        order.setAdresseLivraison(request.adresseLivraison());
        order.setVille(request.ville());
        order.setClientNom(request.clientNom());
        order.setClientTelephone(request.clientTelephone());
        order.setClientEmail(request.clientEmail());

        for (CartItem item : cart.getItems()) {
            ProductVariant variant = item.getProductVariant();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductVariant(variant);
            orderItem.setNomProduit(variant.getProduct().getNom());
            orderItem.setTaille(variant.getTaille());
            orderItem.setCouleur(variant.getCouleur());
            orderItem.setQuantite(item.getQuantite());
            orderItem.setPrixUnitaire(variant.getProduct().getPrix());
            order.getItems().add(orderItem);

            variant.setStock(variant.getStock() - item.getQuantite());
            Product product = variant.getProduct();
            product.setNbVentes(product.getNbVentes() + item.getQuantite());
            productRepository.save(product);
        }

        orderRepository.save(order);

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setPromotion(null);
        cartRepository.save(cart);

        String paymentUrl = paymentService.initiatePaymentIfNeeded(order);

        return new CheckoutResponse(OrderDto.from(order), paymentUrl);
    }

    @Transactional(readOnly = true)
    public OrderDto getById(Long id) {
        return OrderDto.from(findById(id));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> listByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(OrderDto::from).toList();
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> listAdmin(String statut, int page, int size) {
        OrderStatus status = null;
        if (statut != null && !statut.isBlank() && !"TOUTES".equalsIgnoreCase(statut)) {
            status = OrderStatus.valueOf(statut);
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findByStatutOptional(status, pageable).map(OrderDto::from);
    }

    @Transactional
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public OrderDto updateStatus(Long id, String newStatus) {
        Order order = findById(id);
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Statut de commande invalide.");
        }
        order.setStatut(status);
        orderRepository.save(order);
        notificationDispatcher.notifyOrderStatusChange(order);
        return OrderDto.from(order);
    }

    private Order findById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> ApiException.notFound("Commande introuvable."));
    }

    private Cart resolveExistingCart(User user, String sessionToken) {
        if (user != null) {
            return cartRepository.findByUserId(user.getId())
                    .orElseThrow(() -> ApiException.badRequest("Le panier est vide."));
        }
        if (sessionToken == null) {
            throw ApiException.badRequest("Panier introuvable.");
        }
        return cartRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> ApiException.badRequest("Panier introuvable."));
    }

    private String generateNumero() {
        long next = orderRepository.count() + 1;
        String candidate = String.format("MRD-%06d", next);
        while (orderRepository.findByNumero(candidate).isPresent()) {
            next++;
            candidate = String.format("MRD-%06d", next);
        }
        return candidate;
    }
}
