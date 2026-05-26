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
        mockMvc.perform(post("/products/1/discount")
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
        mockMvc.perform(post("/cart/add")
                        .param("productId", "1")
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
        mockMvc.perform(post("/cart/add")
                        .param("productId", "1")
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
        mockMvc.perform(post("/cart/add")
                .param("productId", "1")
                .param("quantity", "1"));

        mockMvc.perform(post("/orders/create"))
                .andExpect(status().isOk());
    }

    @Test
    void createOrderEmptyCart() throws Exception {
        mockMvc.perform(post("/orders/create"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void payOrder() throws Exception {
        mockMvc.perform(post("/cart/add")
                .param("productId", "1")
                .param("quantity", "1"));

        mockMvc.perform(post("/orders/create"));

        mockMvc.perform(post("/orders/1/pay"))
                .andExpect(status().isOk());
    }

    @Test
    void cancelOrder() throws Exception {
        mockMvc.perform(post("/cart/add")
                .param("productId", "1")
                .param("quantity", "1"));

        mockMvc.perform(post("/orders/create"));

        mockMvc.perform(post("/orders/1/cancel"))
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
        mockMvc.perform(post("/cart/add")
                .param("productId", "1")
                .param("quantity", "1"));

        mockMvc.perform(post("/cart/add")
                .param("productId", "1")
                .param("quantity", "2"))
                .andExpect(status().isOk());
    }

    @Test
    void discountEdgeCase() throws Exception {
        mockMvc.perform(post("/products/1/discount")
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
                        .content("{\"nombre\":\"X\",\"precio\":1,\"stock\":1}"))
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
                        .content("{\"nombre\":\"Ana\",\"email\":\"ana@test.com\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void getUserById() throws Exception {

        // Crear usuario y capturar respuesta
        String response = mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Ana\",\"email\":\"ana@test.com\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extraer el ID del JSON (rápido y simple)
        String id = response.split("\"id\":")[1].split(",")[0];

        // Usar ese ID real
        mockMvc.perform(get("/users/" + id))
                .andExpect(status().isOk());
    }

    @Test
    void deleteUser() throws Exception {
        // 🔥 FIX: crear antes de eliminar
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Ana\",\"email\":\"ana@test.com\"}"));

        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getInvalidUser() throws Exception {
        mockMvc.perform(get("/users/999"))
                .andExpect(status().isNotFound());
    }
}