package com.example.orders_exercise.controller

import com.example.orders_exercise.dto.OrderDto
import com.example.orders_exercise.dto.kafka.OrderEvent
import com.example.orders_exercise.entity.Order
import com.example.orders_exercise.entity.OrderStatus
import com.example.orders_exercise.repository.OrderRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.serialization.StringDeserializer
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.kafka.support.serializer.JsonDeserializer
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.testcontainers.containers.KafkaContainer
import org.testcontainers.utility.DockerImageName
import spock.lang.Shared
import spock.lang.Specification

import java.time.LocalDateTime

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
@ContextConfiguration
class OrderControllerIntegrationSpec extends Specification {

    @Autowired
    private MockMvc mockMvc

    @Autowired
    private OrderRepository orderRepository

    @Autowired
    private ObjectMapper objectMapper

    @Shared
    static KafkaContainer kafkaContainer = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:latest"))
            .withReuse(true)

    @Value('${kafka.topic.order-created:order.created}')
    private String orderCreatedTopic

    private KafkaConsumer<String, OrderEvent> consumer

    @DynamicPropertySource
    static void kafkaProperties(DynamicPropertyRegistry registry) {
        kafkaContainer.start()
        println "Kafka bootstrap servers: ${kafkaContainer.getBootstrapServers()}"
        registry.add("spring.kafka.bootstrap-servers", kafkaContainer::getBootstrapServers)
    }

    def setup() {
        orderRepository.deleteAll()

        Properties props = new Properties()
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaContainer.getBootstrapServers())
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "test-group")
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest")
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName())
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class.getName())

        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.example.orders_exercise.dto.kafka")
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, OrderEvent.class.getName())
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false)

        consumer = new KafkaConsumer<>(props)
        consumer.subscribe([orderCreatedTopic])
    }

    def cleanup() {
        orderRepository.deleteAll()
        if (consumer != null) {
            consumer.close()
        }
    }

    def "should create a new order"() {
        given: "order request"
        def orderDto = new OrderDto(null, null, null, 1L, "Test Order")
        def requestJson = objectMapper.writeValueAsString(orderDto)

        when: "POST request is made to create an order"
        def result = mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))

        then: "response is 200"
        result.andExpect(status().isOk())
                .andExpect(jsonPath('$.id').exists())
                .andExpect(jsonPath('$.userId').value(1))
                .andExpect(jsonPath('$.description').value("Test Order"))
                .andExpect(jsonPath('$.status').value("NEW"))
                .andExpect(jsonPath('$.createdAt').exists())

        and: "order is saved in the database"
        orderRepository.count() == 1
        def savedOrder = orderRepository.findAll().first()
        savedOrder.userId == 1L
        savedOrder.description == "Test Order"
        savedOrder.status == OrderStatus.NEW
    }

    def "should retrieve all orders"() {
        given: "some orders exist in the database"
        orderRepository.deleteAll()

        def order1 = new Order()
        order1.setUserId(1L)
        order1.setDescription("Order 1")
        order1.setStatus(OrderStatus.NEW)
        order1.setCreatedAt(LocalDateTime.now())

        def order2 = new Order()
        order2.setUserId(2L)
        order2.setDescription("Order 2")
        order2.setStatus(OrderStatus.NEW)
        order2.setCreatedAt(LocalDateTime.now())

        orderRepository.saveAll([order1, order2])

        when: "GET request is made to retrieve all orders"
        def result = mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andReturn()

        def content = result.response.contentAsString
        def orders = objectMapper.readValue(content, List.class)

        then: "response contains all orders"
        orders.size() == 2
        orders.any { it.description == "Order 1" }
        orders.any { it.description == "Order 2" }
    }

    def "should retrieve an order by id"() {
        given: "order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        def savedOrder = orderRepository.save(order)

        when: "GET request is made to retrieve the order by id"
        def result = mockMvc.perform(get("/api/orders/{id}", savedOrder.id))

        then: "response status is 200 and contains the order details"
        result.andExpect(status().isOk())
                .andExpect(jsonPath('$.id').value(savedOrder.id))
                .andExpect(jsonPath('$.userId').value(1))
                .andExpect(jsonPath('$.description').value("Test Order"))
                .andExpect(jsonPath('$.status').value("NEW"))
    }

    def "should return 404 when retrieving a non-existent order"() {
        when: "GET request is made to retrieve a non-existent order"
        def result = mockMvc.perform(get("/api/orders/999"))

        then: "response status is 404 Not Found"
        result.andExpect(status().isNotFound())
              .andExpect(jsonPath('$.status').value(404))
              .andExpect(jsonPath('$.error').value("Not Found"))
              .andExpect(jsonPath('$.message').exists())
              .andExpect(jsonPath('$.path').exists())
              .andExpect(jsonPath('$.timestamp').exists())
    }

    def "should return 400 when creating an order with invalid data"() {
        given: "invalid order request"
        def orderDto = new OrderDto(null, null, null, null, "")
        def requestJson = objectMapper.writeValueAsString(orderDto)

        when: "POST request is made to create an order with invalid data"
        def result = mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))

        then: "response status is 400 Bad Request"
        result.andExpect(status().isBadRequest())
              .andExpect(jsonPath('$.status').value(400))
              .andExpect(jsonPath('$.error').value("Validation Error"))
              .andExpect(jsonPath('$.message').exists())
              .andExpect(jsonPath('$.path').exists())
              .andExpect(jsonPath('$.timestamp').exists())
              .andExpect(jsonPath('$.validationErrors').exists())
              .andExpect(jsonPath('$.validationErrors.userId').exists())
              .andExpect(jsonPath('$.validationErrors.description').exists())
    }

    def "should return 400 when updating order status with null status"() {
        given: "order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        order.setStatus(OrderStatus.NEW)
        def savedOrder = orderRepository.save(order)

        and: "an invalid status update request"
        def requestJson = '{"status": null}'

        when: "PATCH request is made to update the order status with null status"
        def result = mockMvc.perform(patch("/api/orders/{id}/status", savedOrder.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))

        then: "response status is 400 Bad Request"
        result.andExpect(status().isBadRequest())
              .andExpect(jsonPath('$.status').value(400))
              .andExpect(jsonPath('$.error').value("Validation Error"))
              .andExpect(jsonPath('$.message').exists())
              .andExpect(jsonPath('$.path').exists())
              .andExpect(jsonPath('$.timestamp').exists())
              .andExpect(jsonPath('$.validationErrors').exists())
              .andExpect(jsonPath('$.validationErrors.status').exists())
    }

    def "should delete an order"() {
        given: "order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        def savedOrder = orderRepository.save(order)

        when: "DELETE request is made to delete the order"
        def result = mockMvc.perform(delete("/api/orders/{id}", savedOrder.id))

        then: "response status is 204 No Content"
        result.andExpect(status().isNoContent())

        and: "order is removed from the database"
        !orderRepository.existsById(savedOrder.id)
    }
}
