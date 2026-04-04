package com.system.tests.base;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.testcontainers.containers.ComposeContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import java.io.File;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public abstract class BaseSystemTest {

    private static final ComposeContainer COMPOSE;

    protected static String AUTH_URL;
    protected static String CONNECTHUB_URL;
    protected static String LAUNCHPAD_URL;

    static {
        COMPOSE = new ComposeContainer(resolveComposeFile())
                .withLocalCompose(true)
                // Skip services not needed for backend system tests
                .withScaledService("auth-frontend", 0)
                .withScaledService("launchpad-frontend", 0)
                .withScaledService("connecthub-frontend", 0)
                .withScaledService("auth-pgadmin", 0)
                // Wait for auth-service: /.well-known/openid-configuration is a public endpoint
                .withExposedService("auth-service", 8080,
                        Wait.forHttp("/.well-known/openid-configuration")
                                .forStatusCode(200)
                                .withStartupTimeout(Duration.ofMinutes(10)))
                // Wait for connecthub-service: /api/feed returns 401 (unauthenticated), which is < 500
                .withExposedService("connecthub-service", 8080,
                        Wait.forHttp("/api/feed")
                                .forStatusCodeMatching(code -> code < 500)
                                .withStartupTimeout(Duration.ofMinutes(15)))
                // Expose launchpad-service port for future Launchpad system tests
                .withExposedService("launchpad-service", 8080,
                        Wait.forListeningPort()
                                .withStartupTimeout(Duration.ofMinutes(10)));

        COMPOSE.start();

        AUTH_URL = "http://" + COMPOSE.getServiceHost("auth-service", 8080)
                + ":" + COMPOSE.getServicePort("auth-service", 8080);
        CONNECTHUB_URL = "http://" + COMPOSE.getServiceHost("connecthub-service", 8080)
                + ":" + COMPOSE.getServicePort("connecthub-service", 8080);
        LAUNCHPAD_URL = "http://" + COMPOSE.getServiceHost("launchpad-service", 8080)
                + ":" + COMPOSE.getServicePort("launchpad-service", 8080);
    }

    /**
     * Resolves docker-compose.yaml relative to this compiled class location.
     * Works regardless of the Maven working directory.
     * Path: tests/target/test-classes → tests/target → tests → project-root
     */
    private static File resolveComposeFile() {
        try {
            URL location = BaseSystemTest.class.getProtectionDomain().getCodeSource().getLocation();
            Path testClasses = Paths.get(location.toURI());
            Path projectRoot = testClasses.getParent().getParent().getParent();
            return projectRoot.resolve("docker-compose.yaml").toFile();
        } catch (Exception e) {
            throw new RuntimeException("Cannot resolve docker-compose.yaml", e);
        }
    }

    // Default user credentials for testing
    protected static final String USERNAME = "studenttest";
    protected static final String TEST_EMAIL = "testuser@gmail.com";
    protected static final String TEST_PASSWORD = "testpassword123";
    protected static final String USER_ROLE = "STUDENT";

    // Second user credentials for messaging tests
    protected static final String SECOND_USERNAME = "seconduser";
    protected static final String SECOND_EMAIL = "seconduser@gmail.com";
    protected static final String SECOND_PASSWORD = "secondpassword123";
    protected static final String SECOND_USER_ROLE = "STUDENT";

    protected static final String SCHOOL_ID = "d437c52b-3158-46bd-aa8c-de61511b23f0";
    protected static final Integer AGE = 18;

    protected static final HttpClient httpClient = HttpClient.newHttpClient();
    protected static final ObjectMapper objectMapper = new ObjectMapper();

    protected static String authToken;
    protected static String secondAuthToken;
    protected static String firstUserId;
    protected static String secondUserId;

    @BeforeAll
    static void authenticate() throws Exception {
        AuthResult r1 = authenticateUser(USERNAME, TEST_EMAIL, TEST_PASSWORD, USER_ROLE);
        AuthResult r2 = authenticateUser(SECOND_USERNAME, SECOND_EMAIL, SECOND_PASSWORD, SECOND_USER_ROLE);

        authToken = r1.accessToken();
        secondAuthToken = r2.accessToken();

        firstUserId = r1.userId();
        secondUserId = r2.userId();
    }

    private static AuthResult authenticateUser(String username, String email, String password, String role) throws Exception {
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

        HttpResponse<String> loginResponse = httpClient.send(loginHttpRequest, HttpResponse.BodyHandlers.ofString());
        int loginStatus = loginResponse.statusCode();
        Assertions.assertEquals(200, loginStatus);

        String accessToken = objectMapper.readTree(loginResponse.body()).get("accessToken").asText();
        String refreshToken = objectMapper.readTree(loginResponse.body()).get("refreshToken").asText();

        HttpRequest validateRequest = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/validate"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> validateResponse = httpClient.send(validateRequest, HttpResponse.BodyHandlers.ofString());
        Assertions.assertEquals(200, validateResponse.statusCode());
        String userId = objectMapper.readTree(validateResponse.body()).get("userId").asText();

        return new AuthResult(accessToken, refreshToken, userId);
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