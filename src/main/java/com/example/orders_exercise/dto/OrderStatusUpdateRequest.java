package com.example.orders_exercise.dto;

import com.example.orders_exercise.entity.OrderStatus;

public record OrderStatusUpdateRequest(OrderStatus status) {
}
