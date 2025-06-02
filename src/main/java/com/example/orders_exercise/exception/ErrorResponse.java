package com.example.orders_exercise.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Getter
@RequiredArgsConstructor
public class ErrorResponse {
    private final LocalDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final Map<String, String> validationErrors;

    public ErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, new HashMap<>());
    }

    public ErrorResponse(int status, String error, String message, String path, Map<String, String> validationErrors) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.validationErrors = validationErrors;
    }

}
