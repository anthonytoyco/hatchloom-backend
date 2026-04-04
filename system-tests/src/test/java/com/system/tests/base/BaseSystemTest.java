package com.system.tests.base;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
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
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;

import com.fasterxml.jackson.databind.ObjectMapper;

public abstract class BaseSystemTest {

        private static final Duration AUTH_STARTUP_TIMEOUT = Duration.ofMinutes(3);
        private static final Duration CONNECTHUB_STARTUP_TIMEOUT = Duration.ofMinutes(5);
        private static final Duration LAUNCHPAD_STARTUP_TIMEOUT = Duration.ofMinutes(4);

        private static final Duration COMPOSE_UP_TIMEOUT = Duration.ofMinutes(5);
        private static final Duration HEALTH_POLL_INTERVAL = Duration.ofSeconds(3);
        private static final Duration HTTP_CONNECT_TIMEOUT = Duration.ofSeconds(5);
        private static final Duration HTTP_REQUEST_TIMEOUT = Duration.ofSeconds(20);
        private static final Duration WAIT_PROGRESS_INTERVAL = Duration.ofSeconds(15);
        private static final HttpClient STARTUP_HTTP_CLIENT = HttpClient.newBuilder()
                        .connectTimeout(HTTP_CONNECT_TIMEOUT)
                        .build();

        protected static String AUTH_URL;
        protected static String CONNECTHUB_URL;
        protected static String LAUNCHPAD_URL;

        static {
                File composeFile = resolveComposeFile();
                AUTH_URL = "http://localhost:8081";
                CONNECTHUB_URL = "http://localhost:8083";
                LAUNCHPAD_URL = "http://localhost:8082";

                try {
                        System.err.println("[system-tests] Ensuring backend stack is running...");
                        ensureBackendStackRunning(composeFile);
                        System.err.println("[system-tests] Backend stack is ready.");
                } catch (RuntimeException e) {
                        dumpComposeDiagnostics(composeFile);
                        throw e;
                }
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
                        return projectRoot.resolve("docker-compose.test.yaml").toFile();
                } catch (Exception e) {
                        throw new RuntimeException("Cannot resolve docker-compose.test.yaml", e);
                }
        }

        private static void ensureBackendStackRunning(File composeFile) {
                if (isAuthReady() && isConnectHubReady()) {
                        return;
                }

                File projectRoot = composeFile.getParentFile();
                runComposeUp(projectRoot);
                waitForHttpOk(AUTH_URL + "/.well-known/openid-configuration", AUTH_STARTUP_TIMEOUT, "auth-service");
                waitForHttpUnder500(CONNECTHUB_URL + "/api/feed", CONNECTHUB_STARTUP_TIMEOUT, "connecthub-service");
                waitForTcpReachable(LAUNCHPAD_URL, LAUNCHPAD_STARTUP_TIMEOUT, "launchpad-service");
        }

        private static boolean isAuthReady() {
                return tryGet(AUTH_URL + "/.well-known/openid-configuration", code -> code == 200);
        }

        private static boolean isConnectHubReady() {
                return tryGet(CONNECTHUB_URL + "/api/feed", code -> code < 500);
        }

        private static boolean tryGet(String url, java.util.function.IntPredicate statusPredicate) {
                try {
                        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                                        .timeout(Duration.ofSeconds(5))
                                        .GET()
                                        .build();
                        int status = STARTUP_HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.discarding())
                                        .statusCode();
                        return statusPredicate.test(status);
                } catch (Exception ex) {
                        return false;
                }
        }

        private static void runComposeUp(File projectRoot) {
                ProcessBuilder pb = new ProcessBuilder(
                                "docker", "compose", "-f", "docker-compose.test.yaml", "up", "-d", "--build");
                pb.directory(projectRoot);
                pb.redirectErrorStream(true);
                try {
                        System.err.println("[system-tests] Running docker compose up -d --build...");
                        Process process = pb.start();
                        StringBuilder outputBuffer = new StringBuilder(4096);
                        Thread outputReader = new Thread(() -> {
                                try {
                                        String output = new String(process.getInputStream().readAllBytes());
                                        synchronized (outputBuffer) {
                                                outputBuffer.append(output);
                                        }
                                } catch (IOException ex) {
                                        throw new UncheckedIOException(ex);
                                }
                        }, "compose-output-reader");
                        outputReader.setDaemon(true);
                        outputReader.start();

                        boolean finished = process.waitFor(COMPOSE_UP_TIMEOUT.toSeconds(), TimeUnit.SECONDS);
                        outputReader.join(2000);

                        String output;
                        synchronized (outputBuffer) {
                                output = outputBuffer.toString();
                        }

                        if (!finished) {
                                process.destroyForcibly();
                                throw new RuntimeException("docker compose up timed out after "
                                                + COMPOSE_UP_TIMEOUT.toMinutes() + " minutes. Output:\n" + output);
                        }
                        int exitCode = process.exitValue();
                        if (exitCode != 0) {
                                throw new RuntimeException("docker compose up failed with exit code " + exitCode
                                                + ". Output:\n" + output);
                        }
                } catch (IOException e) {
                        throw new RuntimeException("Failed to run docker compose up", e);
                } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Failed to run docker compose up", e);
                }
        }

        private static void waitForHttpOk(String url, Duration timeout, String serviceName) {
                waitForCondition(timeout, serviceName, () -> tryGet(url, status -> status == 200));
        }

        private static void waitForHttpUnder500(String url, Duration timeout, String serviceName) {
                waitForCondition(timeout, serviceName, () -> tryGet(url, status -> status < 500));
        }

        private static void waitForTcpReachable(String baseUrl, Duration timeout, String serviceName) {
                waitForCondition(timeout, serviceName, () -> {
                        try {
                                HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl))
                                                .timeout(Duration.ofSeconds(3))
                                                .GET()
                                                .build();
                                STARTUP_HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.discarding());
                                return true;
                        } catch (Exception ex) {
                                return false;
                        }
                });
        }

        private static void waitForCondition(Duration timeout, String serviceName,
                        java.util.function.BooleanSupplier condition) {
                long deadline = System.nanoTime() + timeout.toNanos();
                long lastProgressLogNanos = System.nanoTime();
                while (System.nanoTime() < deadline) {
                        if (condition.getAsBoolean()) {
                                return;
                        }
                        if (System.nanoTime() - lastProgressLogNanos >= WAIT_PROGRESS_INTERVAL.toNanos()) {
                                System.err.println("[system-tests] Waiting for " + serviceName + "...");
                                lastProgressLogNanos = System.nanoTime();
                        }
                        try {
                                Thread.sleep(HEALTH_POLL_INTERVAL.toMillis());
                        } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                                throw new RuntimeException("Interrupted while waiting for " + serviceName, e);
                        }
                }
                throw new RuntimeException("Timed out waiting for " + serviceName + " to become healthy");
        }

        private static void dumpComposeDiagnostics(File composeFile) {
                File projectRoot = composeFile.getParentFile();
                runComposeCommand(projectRoot, "ps", "-a");
                runComposeCommand(projectRoot, "logs", "--tail", "120");
        }

        private static void runComposeCommand(File projectRoot, String... args) {
                try {
                        String[] cmd = new String[args.length + 4];
                        cmd[0] = "docker";
                        cmd[1] = "compose";
                        cmd[2] = "-f";
                        cmd[3] = "docker-compose.test.yaml";
                        System.arraycopy(args, 0, cmd, 4, args.length);

                        Process process = new ProcessBuilder(cmd)
                                        .directory(projectRoot)
                                        .redirectErrorStream(true)
                                        .start();

                        String output = new String(process.getInputStream().readAllBytes());
                        int exitCode = process.waitFor();

                        System.err.println("[system-tests] docker compose " + String.join(" ", args)
                                        + " (exit=" + exitCode + ")");
                        System.err.println(output);
                } catch (Exception ex) {
                        System.err.println("[system-tests] Failed to collect docker compose diagnostics: "
                                        + ex.getMessage());
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

        protected static final HttpClient httpClient = HttpClient.newBuilder()
                        .connectTimeout(HTTP_CONNECT_TIMEOUT)
                        .build();
        protected static final ObjectMapper objectMapper = new ObjectMapper();

        protected static String authToken;
        protected static String secondAuthToken;
        protected static String firstUserId;
        protected static String secondUserId;

        @BeforeAll
        static void authenticate() throws Exception {
                System.err.println("[system-tests] Authenticating test users...");
                AuthResult r1 = authenticateUser(USERNAME, TEST_EMAIL, TEST_PASSWORD, USER_ROLE);
                AuthResult r2 = authenticateUser(SECOND_USERNAME, SECOND_EMAIL, SECOND_PASSWORD, SECOND_USER_ROLE);

                authToken = r1.accessToken();
                secondAuthToken = r2.accessToken();

                firstUserId = r1.userId();
                secondUserId = r2.userId();
                System.err.println("[system-tests] Authentication complete.");
        }

        private static AuthResult authenticateUser(String username, String email, String password, String role)
                        throws Exception {
                Map<String, Object> registerRequest = new HashMap<>();
                registerRequest.put("username", username);
                registerRequest.put("email", email);
                registerRequest.put("password", password);
                registerRequest.put("role", role);
                registerRequest.put("schoolId", SCHOOL_ID);
                registerRequest.put("age", AGE);

                HttpRequest registerHttpRequest = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/register"))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .POST(HttpRequest.BodyPublishers
                                                .ofString(objectMapper.writeValueAsString(registerRequest)))
                                .build();

                HttpResponse<String> registerResponse = httpClient.send(registerHttpRequest,
                                HttpResponse.BodyHandlers.ofString());
                int registerStatus = registerResponse.statusCode();

                Assertions.assertTrue(
                                registerStatus == 201 || registerStatus == 400,
                                "Register failed. Expected 201 or 400, got " + registerStatus + ". Body: "
                                                + registerResponse.body());

                Map<String, Object> loginRequest = new HashMap<>();
                loginRequest.put("username", username);
                loginRequest.put("password", password);

                HttpRequest loginHttpRequest = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/login"))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .POST(HttpRequest.BodyPublishers
                                                .ofString(objectMapper.writeValueAsString(loginRequest)))
                                .build();

                HttpResponse<String> loginResponse = httpClient.send(loginHttpRequest,
                                HttpResponse.BodyHandlers.ofString());
                int loginStatus = loginResponse.statusCode();
                Assertions.assertEquals(200, loginStatus);

                String accessToken = objectMapper.readTree(loginResponse.body()).get("accessToken").asText();
                String refreshToken = objectMapper.readTree(loginResponse.body()).get("refreshToken").asText();

                HttpRequest validateRequest = HttpRequest.newBuilder(URI.create(AUTH_URL + "/auth/validate"))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .header("Authorization", "Bearer " + accessToken)
                                .GET()
                                .build();

                HttpResponse<String> validateResponse = httpClient.send(validateRequest,
                                HttpResponse.BodyHandlers.ofString());
                Assertions.assertEquals(200, validateResponse.statusCode());
                String userId = objectMapper.readTree(validateResponse.body()).get("userId").asText();

                return new AuthResult(accessToken, refreshToken, userId);
        }

        protected HttpResponse<String> get(String url, String path) throws Exception {
                return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .header("Authorization", "Bearer " + authToken)
                                .GET()
                                .build(),
                                HttpResponse.BodyHandlers.ofString());
        }

        protected HttpResponse<String> post(String url, String path, Object body) throws Exception {
                return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .header("Authorization", "Bearer " + authToken)
                                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                                .build(),
                                HttpResponse.BodyHandlers.ofString());
        }

        protected HttpResponse<String> patch(String url, String path, Object body) throws Exception {
                return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .header("Authorization", "Bearer " + authToken)
                                .method("PATCH", HttpRequest.BodyPublishers
                                                .ofString(objectMapper.writeValueAsString(body)))
                                .build(),
                                HttpResponse.BodyHandlers.ofString());
        }

        protected HttpResponse<String> put(String url, String path, Object body) throws Exception {
                return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .header("Authorization", "Bearer " + authToken)
                                .PUT(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                                .build(),
                                HttpResponse.BodyHandlers.ofString());
        }

        protected HttpResponse<String> delete(String url, String path) throws Exception {
                return httpClient.send(HttpRequest.newBuilder(URI.create(url + path))
                                .timeout(HTTP_REQUEST_TIMEOUT)
                                .header("Content-Type", "application/json")
                                .header("Authorization", "Bearer " + authToken)
                                .DELETE()
                                .build(),
                                HttpResponse.BodyHandlers.ofString());
        }
}