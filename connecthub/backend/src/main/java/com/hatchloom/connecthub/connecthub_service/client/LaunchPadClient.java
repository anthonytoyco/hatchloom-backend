package com.hatchloom.connecthub.connecthub_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

/**
 * HTTP client for the LaunchPad service.
 *
 * <p>
 * Consumes the public Position Status Interface:
 * {@code GET /positions/{positionId}/status}
 * which returns "OPEN", "FILLED", or "CLOSED" as plain text.
 * </p>
 */
@Service
public class LaunchPadClient {

    private final RestTemplate restTemplate;
    private final String launchpadBaseUrl;

    public LaunchPadClient(RestTemplate restTemplate,
            @Value("${launchpad.service.url}") String launchpadBaseUrl) {
        this.restTemplate = restTemplate;
        this.launchpadBaseUrl = launchpadBaseUrl;
    }

    /**
     * Fetches the current status of a LaunchPad position.
     *
     * @param positionId the UUID of the position to check
     * @return status string: "OPEN", "FILLED", or "CLOSED"
     * @throws IllegalArgumentException if the position does not exist (404)
     * @throws IllegalStateException    if the LaunchPad service is unreachable
     */
    public String getPositionStatus(UUID positionId) {
        String url = launchpadBaseUrl + "/positions/" + positionId + "/status";
        try {
            return restTemplate.getForObject(url, String.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new IllegalArgumentException("Position " + positionId + " not found in LaunchPad");
        } catch (RestClientException e) {
            throw new IllegalStateException("LaunchPad service is unavailable: " + e.getMessage(), e);
        }
    }
}
