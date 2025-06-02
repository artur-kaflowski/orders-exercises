package com.example.orders_exercise.exception;

public class OrderNotFoundException extends RuntimeException {
    
    public OrderNotFoundException(Long id) {
        super("Order not found with id: " + id);
    }
    
    public OrderNotFoundException(String message) {
        super(message);
    }
}
