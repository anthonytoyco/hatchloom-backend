package com.system.tests.integration;

import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.system.tests.base.BaseSystemTest;

public class CrossServiceContractsSystemTest extends BaseSystemTest {

    private String createSandbox() throws Exception {
        HttpResponse<String> response = post(LAUNCHPAD_URL, "/sandboxes", Map.of(
                "studentId", firstUserId,
                "title", "System Sandbox " + UUID.randomUUID(),
                "description", "System test sandbox"));
        Assertions.assertEquals(201, response.statusCode());
        return objectMapper.readTree(response.body()).get("id").asText();
    }

    private String createSideHustle(String sandboxId) throws Exception {
        HttpResponse<String> response = post(LAUNCHPAD_URL, "/sidehustles", Map.of(
                "studentId", firstUserId,
                "sandboxId", sandboxId,
                "title", "System SideHustle " + UUID.randomUUID(),
                "description", "System test side hustle",
                "type", "IN_THE_LAB"));
        Assertions.assertEquals(201, response.statusCode());
        return objectMapper.readTree(response.body()).get("id").asText();
    }

    private String createPosition(String sideHustleId) throws Exception {
        HttpResponse<String> response = post(LAUNCHPAD_URL, "/sidehustles/" + sideHustleId + "/positions",
                Map.of(
                        "title", "System Position " + UUID.randomUUID(),
                        "description", "System test position"));
        Assertions.assertEquals(200, response.statusCode());
        return objectMapper.readTree(response.body()).get("id").asText();
    }

    @Test
    @DisplayName("LaunchPad position status interface is publicly accessible")
    void testPositionStatusEndpointIsPublic() throws Exception {
        String sandboxId = createSandbox();
        String sideHustleId = createSideHustle(sandboxId);
        String positionId = createPosition(sideHustleId);

        HttpRequest unauthenticatedRequest = HttpRequest.newBuilder(
                URI.create(LAUNCHPAD_URL + "/positions/" + positionId + "/status"))
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();

        HttpResponse<String> statusResponse = httpClient.send(unauthenticatedRequest,
                HttpResponse.BodyHandlers.ofString());

        Assertions.assertEquals(200, statusResponse.statusCode());
        Assertions.assertEquals("OPEN", statusResponse.body());
    }

    @Test
    @DisplayName("ConnectHub classified creation respects LaunchPad position status")
    void testClassifiedCreationRequiresOpenLaunchPadPosition() throws Exception {
        String sandboxId = createSandbox();
        String sideHustleId = createSideHustle(sandboxId);
        String positionId = createPosition(sideHustleId);

        HttpResponse<String> createClassifiedResponse = post(CONNECTHUB_URL, "/api/classified", Map.of(
                "basePost", Map.of(
                        "title", "System Classified " + UUID.randomUUID(),
                        "content", "Cross-service contract test"),
                "projectId", UUID.randomUUID().toString(),
                "positionId", positionId,
                "status", "open"));

        Assertions.assertEquals(201, createClassifiedResponse.statusCode());
        Assertions.assertEquals(positionId,
                objectMapper.readTree(createClassifiedResponse.body()).get("positionId").asText());

        HttpResponse<String> updatePositionStatusResponse = put(LAUNCHPAD_URL,
                "/sidehustles/" + sideHustleId + "/positions/" + positionId + "/status",
                Map.of("status", "FILLED"));
        Assertions.assertEquals(200, updatePositionStatusResponse.statusCode());

        HttpResponse<String> rejectedClassifiedResponse = post(CONNECTHUB_URL, "/api/classified", Map.of(
                "basePost", Map.of(
                        "title", "Blocked Classified " + UUID.randomUUID(),
                        "content", "Should fail when position is not OPEN"),
                "projectId", UUID.randomUUID().toString(),
                "positionId", positionId,
                "status", "open"));

        Assertions.assertEquals(400, rejectedClassifiedResponse.statusCode());
    }
}
