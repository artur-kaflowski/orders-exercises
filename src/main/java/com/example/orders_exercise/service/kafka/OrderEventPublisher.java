package com.example.orders_exercise.service.kafka;

import com.example.orders_exercise.dto.kafka.OrderEvent;
import com.example.orders_exercise.entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.order-created:order.created}")
    private String orderCreatedTopic;

    @Value("${kafka.topic.order-status-changed:order.status.changed}")
    private String orderStatusChangedTopic;

    public OrderEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderCreated(Order order) {
        OrderEvent event = new OrderEvent(order.getId(), order.getCreatedAt(), order.getStatus(), order.getUserId(), order.getDescription());
        kafkaTemplate.send(orderCreatedTopic, event);
    }

//    public void publishOrderStatusChanged(Long orderId, String oldStatus, String newStatus) {
//        OrderStatusChangedEvent event = new OrderStatusChangedEvent(
//                orderId, oldStatus, newStatus, LocalDateTime.now()
//        );
//        kafkaTemplate.send(orderStatusChangedTopic, event);
//    }
}
