package com.example.orders_exercise.dto;

import com.example.orders_exercise.entity.OrderStatus;

import java.time.LocalDateTime;

public record OrderSearchRequest(Long id, OrderStatus status, Long userId, String description, LocalDateTime startDate, LocalDateTime endDate) {
}
