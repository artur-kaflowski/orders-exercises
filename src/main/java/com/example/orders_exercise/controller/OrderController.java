package com.example.orders_exercise.controller;

import com.example.orders_exercise.dto.OrderDto;
import com.example.orders_exercise.dto.OrderSearchRequest;
import com.example.orders_exercise.dto.OrderStatusUpdateRequest;
import com.example.orders_exercise.entity.Order;
import com.example.orders_exercise.entity.OrderStatus;
import com.example.orders_exercise.exception.OrderNotFoundException;
import com.example.orders_exercise.exception.ValidationException;
import com.example.orders_exercise.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@RequestBody OrderDto request) {
        Map<String, String> errors = validateOrderDto(request);
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        Order order = new Order();
        order.setUserId(request.userId());
        order.setDescription(request.description());
        Order savedOrder = orderService.saveOrder(order);
        return ResponseEntity.ok(mapToDto(savedOrder));
    }

    @GetMapping
    public List<OrderDto> getAllOrders() {
        return orderService.getAllOrders().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return ResponseEntity.ok(mapToDto(order));
    }

    @GetMapping("/getFromKafka")
    public ResponseEntity<OrderDto> getFromKafka() {
        Order order = orderService.getOrderFromQueue()
                .orElseThrow(() -> new OrderNotFoundException("No order found in Kafka queue"));
        return ResponseEntity.ok(mapToDto(order));
    }

    @PostMapping("/search")
    public List<OrderDto> searchOrders(@RequestBody OrderSearchRequest request) {
        return orderService.searchOrders(
                request.id(),
                request.status(),
                request.userId(),
                request.description(),
                request.startDate(),
                request.endDate()
        ).stream()
         .map(this::mapToDto)
         .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request) {

        if (request.status() == null) {
            throw new ValidationException("status", "Status cannot be null");
        }

        Order updatedOrder = orderService.updateOrderStatus(id, request.status());
        return ResponseEntity.ok(mapToDto(updatedOrder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, String> validateOrderDto(OrderDto orderDto) {
        Map<String, String> errors = new HashMap<>();

        if (orderDto.userId() == null) {
            errors.put("userId", "User ID cannot be null");
        }

        if (orderDto.description() == null || orderDto.description().trim().isEmpty()) {
            errors.put("description", "Description cannot be empty");
        }

        return errors;
    }

    private OrderDto mapToDto(Order order) {
        return new OrderDto(
                order.getId(),
                order.getCreatedAt(),
                order.getStatus(),
                order.getUserId(),
                order.getDescription()
        );
    }
}
