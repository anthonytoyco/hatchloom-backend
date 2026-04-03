package com.system.tests.base;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;


import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

public abstract class BaseSystemTest {
    // Service URLS for local testing
    protected static final String AUTH_URL = "http://localhost:8081";
    protected static final String LAUNCHPAD_URL = "http://localhost:8082";
    protected static final String CONNECTHUB_URL = "http://localhost:8083";

    // Default user credentials just for testing
    protected static final String USERNAME = "studenttest";
    protected static final String TEST_EMAIL = "testuser@gmail.com";
    protected static final String TEST_PASSWORD = "testpassword123";
    protected static final String USER_ROLE = "STUDENT";

    // randomly generated UUID
    protected static final String SCHOOL_ID = "d437c52b-3158-46bd-aa8c-de61511b23f0";
    protected static final Integer AGE = 18;

    protected static final HttpClient httpClient = HttpClient.newHttpClient();
    protected static final ObjectMapper objectMapper = new ObjectMapper();

    protected static String authToken;

    @BeforeAll
    static void authenticate() throws Exception {
        Map<String, Object> registerRequest = new HashMap<>();
        registerRequest.put("username", USERNAME);
        registerRequest.put("email", TEST_EMAIL);
        registerRequest.put("password", TEST_PASSWORD);
        registerRequest.put("role", USER_ROLE);
        registerRequest.put("schoolId", SCHOOL_ID);
        registerRequest.put("age", AGE);

        String registerJson = objectMapper.writeValueAsString(registerRequest);

        HttpRequest request = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(registerJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        int registerStatus = response.statusCode();

        Assertions.assertTrue(
                registerStatus == 201 || registerStatus == 400,
                "Register failed. Expected 201 or 400, got " + registerStatus + ". Body: " + response.body()
        );

        Map<String, Object> loginRequest = new HashMap<>();
        loginRequest.put("username", USERNAME);
        loginRequest.put("password", TEST_PASSWORD);

        String loginJson = objectMapper.writeValueAsString(loginRequest);
        HttpRequest loginHttpRequest = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(loginJson))
                .build();

        HttpResponse<String> loginResponse = httpClient.send(loginHttpRequest, HttpResponse.BodyHandlers.ofString());
        Assertions.assertEquals(200, loginResponse.statusCode());

        authToken = objectMapper.readTree(loginResponse.body()).get("accessToken").asText();
    }

    protected HttpResponse<String> get(String url, String path) throws Exception {
        return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + authToken)
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> post(String url, String path, Object body) throws Exception {
        return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build(),
        HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> patch(String url, String path, Object body) throws Exception {
        return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .method("PATCH", HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> put(String url, String path, Object body) throws Exception {
        return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + authToken)
                        .PUT(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> delete(String url, String path) throws Exception {
        return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + authToken)
                        .DELETE()
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }
}