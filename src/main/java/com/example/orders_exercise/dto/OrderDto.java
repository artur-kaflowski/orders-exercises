package com.example.orders_exercise.dto;

import com.example.orders_exercise.entity.OrderStatus;

import java.time.LocalDateTime;

public record OrderDto(Long id, LocalDateTime createdAt, OrderStatus status, Long userId, String description) {
}
