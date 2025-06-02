package com.example.orders_exercise.service.kafka;

import com.example.orders_exercise.dto.kafka.OrderEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;

@Service
public class OrderEventConsumer {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    private final ObjectMapper objectMapper;

    public OrderEventConsumer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public OrderEvent readLastOrderCreatedEvent(String topicName) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "last-message-reader-" + UUID.randomUUID());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            List<TopicPartition> partitions = new ArrayList<>();
            consumer.partitionsFor(topicName).forEach(partitionInfo ->
                    partitions.add(new TopicPartition(partitionInfo.topic(), partitionInfo.partition()))
            );

            consumer.assign(partitions);
            consumer.seekToEnd(partitions);

            long maxOffset = -1;
            TopicPartition targetPartition = null;

            for (TopicPartition partition : partitions) {
                long offset = consumer.position(partition) - 1;
                if (offset >= 0 && offset > maxOffset) {
                    maxOffset = offset;
                    targetPartition = partition;
                }
            }

            if (targetPartition != null && maxOffset >= 0) {
                consumer.seek(targetPartition, maxOffset);
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(2));

                for (ConsumerRecord<String, String> record : records) {
                    System.out.println("DEBUG raw value: " + record.value());
                    return objectMapper.readValue(record.value(), OrderEvent.class);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

}
