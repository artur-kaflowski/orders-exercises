package com.example.orders_exercise.exception;

import lombok.Getter;

import java.util.Map;
import java.util.HashMap;

@Getter
public class ValidationException extends RuntimeException {
    private final Map<String, String> errors;
    
    public ValidationException(Map<String, String> errors) {
        super("Validation failed");
        this.errors = errors;
    }
    
    public ValidationException(String field, String message) {
        super("Validation failed");
        this.errors = new HashMap<>();
        this.errors.put(field, message);
    }

}
