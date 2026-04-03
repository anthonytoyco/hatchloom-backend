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

    // Second Default user credentials for testing (messaging portion)
    protected static final String SECOND_USERNAME = "seconduser";
    protected static final String SECOND_EMAIL = "seconduser@gmail.com";
    protected static final String SECOND_PASSWORD = "secondpassword123";
    protected static final String SECOND_USER_ROLE = "STUDENT";

    // randomly generated UUID
    protected static final String SCHOOL_ID = "d437c52b-3158-46bd-aa8c-de61511b23f0";
    protected static final Integer AGE = 18;

    protected static final HttpClient httpClient = HttpClient.newHttpClient();
    protected static final ObjectMapper objectMapper = new ObjectMapper();

    protected static String authToken;
    protected static String secondAuthToken;

    @BeforeAll
    static void authenticate() throws Exception {
        authToken = authenticateUser(USERNAME, TEST_EMAIL, TEST_PASSWORD, USER_ROLE);
        secondAuthToken = authenticateUser(SECOND_USERNAME, SECOND_EMAIL, SECOND_PASSWORD, SECOND_USER_ROLE);
    }

    private static String authenticateUser(String username, String email, String password, String role) throws Exception {
        Map<String, Object> registerRequest = new HashMap<>();
        registerRequest.put("username", username);
        registerRequest.put("email", email);
        registerRequest.put("password", password);
        registerRequest.put("role", role);
        registerRequest.put("schoolId", SCHOOL_ID);
        registerRequest.put("age", AGE);

        HttpRequest registerHttpRequest = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(registerRequest)))
                .build();

        HttpResponse<String> registerResponse = httpClient.send(registerHttpRequest, HttpResponse.BodyHandlers.ofString());
        int registerStatus = registerResponse.statusCode();

        Assertions.assertTrue(
                registerStatus == 201 || registerStatus == 400,
                "Register failed. Expected 201 or 400, got " + registerStatus + ". Body: " + registerResponse.body()
        );

        Map<String, Object> loginRequest = new HashMap<>();
        loginRequest.put("username", username);
        loginRequest.put("password", password);

        HttpRequest loginHttpRequest = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(loginRequest)))
                .build();


        HttpResponse<String>  loginResponse = httpClient.send(loginHttpRequest, HttpResponse.BodyHandlers.ofString());
        int loginStatus = loginResponse.statusCode();
        Assertions.assertEquals(200, loginStatus);

        return objectMapper.readTree(loginResponse.body()).get("accessToken").asText();
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