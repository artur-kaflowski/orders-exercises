package com.example.orders_exercise.dto.kafka;

import com.example.orders_exercise.entity.OrderStatus;

import java.time.LocalDateTime;

public record OrderStatusChangedEvent(Long orderId, OrderStatus oldStatus, OrderStatus newStatus, LocalDateTime timestamp) {
}
