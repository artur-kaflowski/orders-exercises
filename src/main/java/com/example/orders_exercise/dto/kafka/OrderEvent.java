package com.example.orders_exercise.dto.kafka;

import com.example.orders_exercise.entity.OrderStatus;

import java.time.LocalDateTime;

public record OrderEvent(Long id, LocalDateTime createdAt, OrderStatus status, Long userId, String description) {

}
