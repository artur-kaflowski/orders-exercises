package com.example.orders_exercise.service

import com.example.orders_exercise.dto.kafka.OrderEvent
import com.example.orders_exercise.entity.Order
import com.example.orders_exercise.entity.OrderStatus
import com.example.orders_exercise.repository.OrderRepository
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.serialization.StringDeserializer
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.kafka.support.serializer.JsonDeserializer
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.KafkaContainer
import org.testcontainers.spock.Testcontainers
import org.testcontainers.utility.DockerImageName
import spock.lang.Shared
import spock.lang.Specification

import java.time.Duration

@SpringBootTest
@ContextConfiguration
@Testcontainers
class OrderServiceIntegrationSpec extends Specification {

    @Shared
    static KafkaContainer kafkaContainer = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:latest"))
            .withReuse(true)

    @Autowired
    private OrderService orderService

    @Autowired
    private OrderRepository orderRepository

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

    def "should publish message to Kafka when order is created"() {
        given: "a new order"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Kafka Test Order")

        when: "order is saved"
        def savedOrder = orderService.saveOrder(order)

        then: "order is saved with an ID and default values"
        savedOrder.id != null
        savedOrder.userId == 1L
        savedOrder.description == "Kafka Test Order"
        savedOrder.status == OrderStatus.NEW
        savedOrder.createdAt != null

        and: "message is published to Kafka"
        def records = consumer.poll(Duration.ofSeconds(10))
        records.size() > 0

        def record = records.iterator().next()
        record.value() != null
        record.value().id == savedOrder.id
        record.value().userId == savedOrder.userId
        record.value().description == savedOrder.description
        record.value().status == savedOrder.status
    }

    def "should save new order"() {
        given: "new order"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")

        when: "order is saved"
        def savedOrder = orderService.saveOrder(order)

        then: "order is saved with an ID and default values"
        savedOrder.id != null
        savedOrder.userId == 1L
        savedOrder.description == "Test Order"
        savedOrder.status == OrderStatus.NEW
        savedOrder.createdAt != null

        and: "order exists in the database"
        def foundOrder = orderRepository.findById(savedOrder.id).orElse(null)
        foundOrder != null
        foundOrder.id == savedOrder.id
        foundOrder.userId == 1L
        foundOrder.description == "Test Order"
    }

    def "should retrieve all orders"() {
        given: "multiple orders exist in the database"
        def order1 = new Order()
        order1.setUserId(1L)
        order1.setDescription("Order 1")

        def order2 = new Order()
        order2.setUserId(2L)
        order2.setDescription("Order 2")

        orderRepository.saveAll([order1, order2])

        when: "retrieving all orders"
        def orders = orderService.getAllOrders()

        then: "all orders are returned"
        orders.size() == 2
        orders.any { it.description == "Order 1" && it.userId == 1L }
        orders.any { it.description == "Order 2" && it.userId == 2L }
    }

    def "should retrieve an order by id"() {
        given: "order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        def savedOrder = orderRepository.save(order)

        when: "retrieving the order by id"
        def foundOrder = orderService.getOrderById(savedOrder.id)

        then: "correct order is returned"
        foundOrder.isPresent()
        foundOrder.get().id == savedOrder.id
        foundOrder.get().userId == 1L
        foundOrder.get().description == "Test Order"
    }

    def "should return empty when retrieving a non-existent order"() {
        when: "retrieving a non-existent order"
        def result = orderService.getOrderById(999L)

        then: "an empty Optional is returned"
        !result.isPresent()
    }

    def "should delete an order"() {
        given: "an order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        def savedOrder = orderRepository.save(order)

        when: "deleting the order"
        orderService.deleteOrder(savedOrder.id)

        then: "order is removed from the database"
        !orderRepository.existsById(savedOrder.id)
    }


}
