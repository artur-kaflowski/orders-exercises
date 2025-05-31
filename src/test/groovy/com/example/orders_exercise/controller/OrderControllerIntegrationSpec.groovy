package com.example.orders_exercise.controller

import com.example.orders_exercise.dto.OrderDto
import com.example.orders_exercise.entity.Order
import com.example.orders_exercise.entity.OrderStatus
import com.example.orders_exercise.repository.OrderRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import spock.lang.Specification

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationSpec extends Specification {

    @Autowired
    private MockMvc mockMvc

    @Autowired
    private OrderRepository orderRepository

    @Autowired
    private ObjectMapper objectMapper

    def setup() {
        orderRepository.deleteAll()
    }

    def cleanup() {
        orderRepository.deleteAll()
    }

    def "should create a new order"() {
        given: "an order request"
        def orderDto = new OrderDto(null, null, null, 1L, "Test Order")
        def requestJson = objectMapper.writeValueAsString(orderDto)

        when: "a POST request is made to create an order"
        def result = mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))

        then: "the response status is 200 OK"
        result.andExpect(status().isOk())
                .andExpect(jsonPath('$.id').exists())
                .andExpect(jsonPath('$.userId').value(1))
                .andExpect(jsonPath('$.description').value("Test Order"))
                .andExpect(jsonPath('$.status').value("NEW"))
                .andExpect(jsonPath('$.createdAt').exists())

        and: "the order is saved in the database"
        orderRepository.count() == 1
        def savedOrder = orderRepository.findAll().first()
        savedOrder.userId == 1L
        savedOrder.description == "Test Order"
        savedOrder.status == OrderStatus.NEW
    }

    def "should retrieve all orders"() {
        given: "some orders exist in the database"
        def order1 = new Order()
        order1.setUserId(1L)
        order1.setDescription("Order 1")
        
        def order2 = new Order()
        order2.setUserId(2L)
        order2.setDescription("Order 2")
        
        orderRepository.saveAll([order1, order2])

        when: "a GET request is made to retrieve all orders"
        def result = mockMvc.perform(get("/api/orders"))

        then: "the response status is 200 OK and contains all orders"
        result.andExpect(status().isOk())
                .andExpect(jsonPath('$').isArray())
                .andExpect(jsonPath('$.length()').value(2))
                .andExpect(jsonPath('$[0].description').value("Order 1"))
                .andExpect(jsonPath('$[1].description').value("Order 2"))
    }

    def "should retrieve an order by id"() {
        given: "an order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        def savedOrder = orderRepository.save(order)

        when: "a GET request is made to retrieve the order by id"
        def result = mockMvc.perform(get("/api/orders/{id}", savedOrder.id))

        then: "the response status is 200 OK and contains the order details"
        result.andExpect(status().isOk())
                .andExpect(jsonPath('$.id').value(savedOrder.id))
                .andExpect(jsonPath('$.userId').value(1))
                .andExpect(jsonPath('$.description').value("Test Order"))
                .andExpect(jsonPath('$.status').value("NEW"))
    }

    def "should return 404 when retrieving a non-existent order"() {
        when: "a GET request is made to retrieve a non-existent order"
        def result = mockMvc.perform(get("/api/orders/999"))

        then: "the response status is 404 Not Found"
        result.andExpect(status().isNotFound())
    }

    def "should delete an order"() {
        given: "an order exists in the database"
        def order = new Order()
        order.setUserId(1L)
        order.setDescription("Test Order")
        def savedOrder = orderRepository.save(order)

        when: "a DELETE request is made to delete the order"
        def result = mockMvc.perform(delete("/api/orders/{id}", savedOrder.id))

        then: "the response status is 204 No Content"
        result.andExpect(status().isNoContent())

        and: "the order is removed from the database"
        !orderRepository.existsById(savedOrder.id)
    }
}
