package com.example.orders_exercise.repository;

import com.example.orders_exercise.entity.Order;
import com.example.orders_exercise.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByDescriptionContainingIgnoreCase(String description);
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
