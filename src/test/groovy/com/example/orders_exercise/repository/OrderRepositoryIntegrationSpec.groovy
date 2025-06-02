package com.example.orders_exercise.repository

import com.example.orders_exercise.entity.Order
import com.example.orders_exercise.entity.OrderStatus
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import spock.lang.Specification

import java.time.LocalDateTime

@SpringBootTest
@ContextConfiguration
class OrderRepositoryIntegrationSpec extends Specification {

    @Autowired
    private OrderRepository orderRepository

    def setup() {
        if (orderRepository != null) {
            orderRepository.deleteAll()
        }
    }

    def cleanup() {
        if (orderRepository != null) {
            orderRepository.deleteAll()
        }
    }

    def "should save new order"() {
        given: "new order"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        order.setStatus(OrderStatus.NEW)
        order.setCreatedAt(LocalDateTime.now())

        when: "order is saved"
        def savedOrder = orderRepository.save(order)

        then: "order is saved with an ID"
        savedOrder.id != null

        and: "order can be retrieved by ID"
        def retrievedOrder = orderRepository.findById(savedOrder.id).orElse(null)
        retrievedOrder != null
        retrievedOrder.id == savedOrder.id
        retrievedOrder.userId == 1L
        retrievedOrder.description == "Test Order"
        retrievedOrder.status == OrderStatus.NEW
    }

    def "should retrieve all orders"() {
        given: "multiple orders exist in the database"
        def order1 = new Order()
        order1.setUserId(1L)
        order1.setDescription("Order 1")
        order1.setStatus(OrderStatus.NEW)
        order1.setCreatedAt(LocalDateTime.now())

        def order2 = new Order()
        order2.setUserId(2L)
        order2.setDescription("Order 2")
        order2.setStatus(OrderStatus.PROCESSING)
        order2.setCreatedAt(LocalDateTime.now())

        orderRepository.saveAll([order1, order2])

        when: "retrieving all orders"
        def orders = orderRepository.findAll()

        then: "all orders are returned"
        orders.size() == 2
        orders.any { it.description == "Order 1" && it.status == OrderStatus.NEW }
        orders.any { it.description == "Order 2" && it.status == OrderStatus.PROCESSING }
    }

    def "should delete an order"() {
        given: "order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        order.setStatus(OrderStatus.NEW)
        order.setCreatedAt(LocalDateTime.now())
        def savedOrder = orderRepository.save(order)

        when: "deleting the order"
        orderRepository.deleteById(savedOrder.id)

        then: "the order is removed from the database"
        !orderRepository.existsById(savedOrder.id)
    }

    def "should update an order"() {
        given: "order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Original Description")
        order.setStatus(OrderStatus.NEW)
        order.setCreatedAt(LocalDateTime.now())
        def savedOrder = orderRepository.save(order)

        when: "updating the order"
        savedOrder.setDescription("Updated Description")
        savedOrder.setStatus(OrderStatus.PROCESSING)
        orderRepository.save(savedOrder)

        then: "order is updated in the database"
        def updatedOrder = orderRepository.findById(savedOrder.id).orElse(null)
        updatedOrder != null
        updatedOrder.description == "Updated Description"
        updatedOrder.status == OrderStatus.PROCESSING
    }

}
