package com.marketplace.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MarketplaceTest {

    @Autowired
    private MockMvc mockMvc;

    private String createProductAndGetId() throws Exception {

    String response = mockMvc.perform(post("/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
            {
                "nombre":"Mouse",
                "precio":120,
                "stock":50
            }
            """))
            .andReturn()
            .getResponse()
            .getContentAsString();

    return response.split("\"id\":")[1].split(",")[0];
}

    // ---------- PRODUCTS ----------

        @Test
        void getProducts() throws Exception {
                mockMvc.perform(get("/products"))
                        .andExpect(status().isOk());
        }

        @Test
        void createProduct() throws Exception {
                mockMvc.perform(post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"nombre\":\"Test\",\"precio\":100,\"stock\":5}"))
                        .andExpect(status().isOk());
        }

        @Test
        void createProductInvalid() throws Exception {
                mockMvc.perform(post("/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                        .andExpect(status().isBadRequest());
        }

        @Test
        void applyDiscount() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/products/" + productId + "/discount")
                        .param("porcentaje", "0.1"))
                .andExpect(status().isOk());
        }

        @Test
        void discountInvalidProduct() throws Exception {
                mockMvc.perform(post("/products/999/discount")
                                .param("porcentaje", "0.1"))
                        .andExpect(status().isNotFound());
        }

        // ---------- CART ----------

        @Test
        void addToCart() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/cart/add")
                .param("productId", productId)
                .param("quantity", "1"))
                .andExpect(status().isOk());
        }

        @Test
        void addInvalidProduct() throws Exception {
                mockMvc.perform(post("/cart/add")
                                .param("productId", "999")
                                .param("quantity", "1"))
                        .andExpect(status().isBadRequest());
        }

        @Test
        void addLargeQuantity() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/cart/add")
                .param("productId", productId)
                .param("quantity", "999"))
                .andExpect(status().isBadRequest());
        }

        @Test
        void cartTotal() throws Exception {
                mockMvc.perform(get("/cart/total"))
                        .andExpect(status().isOk());
        }

        // ---------- ORDERS ----------

        @Test
        void createOrder() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/cart/add")
                .param("productId", productId)
                .param("quantity", "1"));

        mockMvc.perform(post("/orders/create"))
                .andExpect(status().isOk());
        }

        @Test
        void createOrderEmptyCart() throws Exception {

        mockMvc.perform(delete("/cart/clear"));

        mockMvc.perform(post("/orders/create"))
                .andExpect(status().isBadRequest());
        }

        @Test
        void payOrder() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/cart/add")
                .param("productId", productId)
                .param("quantity", "1"));

        String response = mockMvc.perform(post("/orders/create"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String orderId = response.split("\"id\":")[1].split(",")[0];

        mockMvc.perform(post("/orders/" + orderId + "/pay"))
                .andExpect(status().isOk());
        }

        @Test
        void cancelOrder() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/cart/add")
                .param("productId", productId)
                .param("quantity", "1"));

        String response = mockMvc.perform(post("/orders/create"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String orderId = response.split("\"id\":")[1].split(",")[0];

        mockMvc.perform(post("/orders/" + orderId + "/cancel"))
                .andExpect(status().isOk());
        }

        @Test
        void payInvalidOrder() throws Exception {
                mockMvc.perform(post("/orders/999/pay"))
                        .andExpect(status().isNotFound());
        }

        @Test
        void cancelInvalidOrder() throws Exception {
                mockMvc.perform(post("/orders/999/cancel"))
                        .andExpect(status().isNotFound());
        }

        // ---------- EXTRA ----------

        @Test
        void addMultipleTimes() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/cart/add")
                .param("productId", productId)
                .param("quantity", "1"));

        mockMvc.perform(post("/cart/add")
                .param("productId", productId)
                .param("quantity", "2"))
                .andExpect(status().isOk());
        }

        @Test
        void discountEdgeCase() throws Exception {

        String productId = createProductAndGetId();

        mockMvc.perform(post("/products/" + productId + "/discount")
                        .param("porcentaje", "0"))
                .andExpect(status().isOk());
        }

        @Test
        void cartTotalAfterAdd() throws Exception {
                mockMvc.perform(post("/cart/add")
                        .param("productId", "1")
                        .param("quantity", "2"));

                mockMvc.perform(get("/cart/total"))
                        .andExpect(status().isOk());
        }

        @Test
        void getProductsAgain() throws Exception {
                mockMvc.perform(get("/products"))
                        .andExpect(status().isOk());
        }

        @Test
        void getProductsFinal() throws Exception {
                mockMvc.perform(get("/products"))
                        .andExpect(status().isOk());
        }

        @Test
        void cartTotalFinal() throws Exception {
                mockMvc.perform(get("/cart/total"))
                        .andExpect(status().isOk());
        }

        @Test
        void createProductMinimal() throws Exception {

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                                "nombre":"Teclado",
                                "precio":50,
                                "stock":10
                        }
                        """))
                .andExpect(status().isOk());
        }

        @Test
        void addCartEdgeCase() throws Exception {
                mockMvc.perform(post("/cart/add")
                                .param("productId", "1")
                                .param("quantity", "0"))
                        .andExpect(status().isBadRequest());
        }

        @Test
        void getCartTotalEmpty() throws Exception {
                mockMvc.perform(get("/cart/total"))
                        .andExpect(status().isOk());
        }

        // ---------- USERS (SOLO CORREGIDO, NO RECORTADO) ----------

        @Test
        void createUser() throws Exception {

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                                "nombre":"Ana",
                                "email":"ana1@test.com",
                                "password":"123456",
                                "role":"USER"
                        }
                        """))
                .andExpect(status().isOk());
        }
        @Test
        void getUserById() throws Exception {

        String response = mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                {
                        "nombre":"Ana",
                        "email":"ana2@test.com",
                        "password":"123456",
                        "role":"USER"
                }
                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = response.split("\"id\":")[1].split(",")[0];

        mockMvc.perform(get("/users/" + id))
                .andExpect(status().isOk());
        }

        @Test
        void deleteUser() throws Exception {

        String response = mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                {
                        "nombre":"Ana",
                        "email":"ana3@test.com",
                        "password":"123456",
                        "role":"USER"
                }
                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = response.split("\"id\":")[1].split(",")[0];

        mockMvc.perform(delete("/users/" + id))
                .andExpect(status().isOk());
        }

        @Test
        void getInvalidUser() throws Exception {
                mockMvc.perform(get("/users/999"))
                        .andExpect(status().isNotFound());
        }
        }