package com.example.orders_exercise.repository;

import com.example.orders_exercise.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Basic CRUD operations are provided by JpaRepository
}
