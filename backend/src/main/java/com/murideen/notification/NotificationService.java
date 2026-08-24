package com.murideen.notification;

import com.murideen.order.Order;

public interface NotificationService {
    void notifyOrderStatusChange(Order order);
}
