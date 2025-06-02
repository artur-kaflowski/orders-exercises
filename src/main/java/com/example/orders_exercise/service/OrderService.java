package com.example.orders_exercise.service;

import com.example.orders_exercise.dto.kafka.OrderEvent;
import com.example.orders_exercise.entity.Order;
import com.example.orders_exercise.entity.OrderStatus;
import com.example.orders_exercise.exception.OrderNotFoundException;
import com.example.orders_exercise.repository.OrderRepository;
import com.example.orders_exercise.repository.OrderSpecification;
import com.example.orders_exercise.service.kafka.OrderEventConsumer;
import com.example.orders_exercise.service.kafka.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;
    private final OrderEventConsumer orderEventConsumer;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderFromQueue() {
        OrderEvent event = orderEventConsumer.readLastOrderCreatedEvent("order.created");
        if (event != null) {
            return Optional.of(new Order(event.id(), event.createdAt(), event.status(), event.userId(), event.description()));
        }
        return Optional.empty();
    }

    public Order saveOrder(Order order) {
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.NEW);
        Order saved = orderRepository.save(order);
        eventPublisher.publishOrderCreated(saved);
        return saved;
    }

    public List<Order> searchOrders(Long id, OrderStatus status, Long userId, 
                                   String description, LocalDateTime startDate, 
                                   LocalDateTime endDate) {
        Specification<Order> spec = OrderSpecification.filterBy(
            id, status, userId, description, startDate, endDate
        );
        return orderRepository.findAll(spec);
    }

    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        eventPublisher.publishOrderStatusChanged(orderId, oldStatus, newStatus);
        return updated;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
