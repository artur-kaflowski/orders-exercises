package com.example.orders_exercise.service

import com.example.orders_exercise.entity.Order
import com.example.orders_exercise.entity.OrderStatus
import com.example.orders_exercise.repository.OrderRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import spock.lang.Specification

@SpringBootTest
class OrderServiceIntegrationSpec extends Specification {

    @Autowired
    private OrderService orderService

    @Autowired
    private OrderRepository orderRepository

    def setup() {
        orderRepository.deleteAll()
    }

    def cleanup() {
        orderRepository.deleteAll()
    }

    def "should save a new order"() {
        given: "a new order"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")

        when: "the order is saved"
        def savedOrder = orderService.saveOrder(order)

        then: "the order is saved with an ID and default values"
        savedOrder.id != null
        savedOrder.userId == 1L
        savedOrder.description == "Test Order"
        savedOrder.status == OrderStatus.NEW
        savedOrder.createdAt != null

        and: "the order exists in the database"
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
        given: "an order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        def savedOrder = orderRepository.save(order)

        when: "retrieving the order by id"
        def foundOrder = orderService.getOrderById(savedOrder.id)

        then: "the correct order is returned"
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

        then: "the order is removed from the database"
        !orderRepository.existsById(savedOrder.id)
    }
}
