package com.example.backend;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.TransferRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BackendIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    private String login() throws Exception {
        String body = mapper.writeValueAsString(new LoginRequest("teste", "123456"));
        String json = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = mapper.readTree(json);
        return node.get("token").asText();
    }

    @Test
    void loginComCredenciaisInvalidas() throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new LoginRequest("teste", "xxx"))))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listagemRequerAutenticacao() throws Exception {
        mvc.perform(get("/api/v1/beneficios"))
           .andExpect(status().is4xxClientError());
    }

    @Test
    void listagemComToken() throws Exception {
        String token = login();
        mvc.perform(get("/api/v1/beneficios").header("Authorization", "Bearer " + token))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void transferenciaSucesso() throws Exception {
        String token = login();
        TransferRequest t = new TransferRequest(1L, 2L, new BigDecimal("100.00"));
        mvc.perform(post("/api/v1/beneficios/transfer")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(t)))
           .andExpect(status().isNoContent());
    }

    @Test
    void transferenciaMesmaContaRejeita() throws Exception {
        String token = login();
        TransferRequest t = new TransferRequest(1L, 1L, new BigDecimal("10"));
        mvc.perform(post("/api/v1/beneficios/transfer")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(t)))
           .andExpect(status().isBadRequest());
    }
}
