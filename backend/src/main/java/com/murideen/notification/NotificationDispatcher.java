package com.murideen.notification;

import com.murideen.order.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/** Diffuse les notifications de changement de statut à tous les canaux disponibles. */
@Component
public class NotificationDispatcher {

    private final List<NotificationService> services;

    public NotificationDispatcher(List<NotificationService> services) {
        this.services = services;
    }

    public void notifyOrderStatusChange(Order order) {
        services.forEach(service -> service.notifyOrderStatusChange(order));
    }
}
