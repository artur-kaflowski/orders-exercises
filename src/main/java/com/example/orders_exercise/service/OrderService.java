package com.example.orders_exercise.service;

import com.example.orders_exercise.entity.Order;
import com.example.orders_exercise.entity.OrderStatus;
import com.example.orders_exercise.repository.OrderRepository;
import com.example.orders_exercise.service.kafka.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order saveOrder(Order order) {
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.NEW);
        Order saved = orderRepository.save(order);
        eventPublisher.publishOrderCreated(saved);
        return orderRepository.save(order);
    }

//    public Order updateOrderStatus(Long orderId, String newStatus) {
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//
//        String oldStatus = order.getStatus();
//        order.setStatus(newStatus);
//        Order updated = orderRepository.save(order);
//
//        eventPublisher.publishOrderStatusChanged(orderId, oldStatus, newStatus);
//        return updated;
//    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
