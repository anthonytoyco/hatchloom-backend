package com.system.tests.message;

import java.net.http.HttpResponse;
import java.util.HashMap;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.system.tests.base.BaseSystemTest;

public class MessageSystemTest extends BaseSystemTest {
    private HashMap<String, Object> body;

    @BeforeEach
    void setup() throws Exception {
        body = new HashMap<>();
    }

    @Test
    @DisplayName("Test sending a message")
    void testSendMessage() throws Exception {
        body.put("conversationId", null);
        body.put("content", "Hello World");
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/message/" + secondUserId + "/send",
                body);

        Assertions.assertEquals(201, response.statusCode());
        var jsonResponse = objectMapper.readTree(response.body());
        Assertions.assertNotNull(jsonResponse);
        Assertions.assertEquals(firstUserId, jsonResponse.get("senderId").asText());
        Assertions.assertEquals(secondUserId, jsonResponse.get("recipientId").asText());
        Assertions.assertEquals("Hello World", jsonResponse.get("content").asText());
        Assertions.assertNotNull(jsonResponse.get("conversationId").asText());
        Assertions.assertNotNull(jsonResponse.get("messageId").asText());

    }

    @Test
    @DisplayName("Test sending a message with empty content")
    void testSendMessageEmptyContent() throws Exception {
        body.put("conversationId", null);
        body.put("content", "");

        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/message/" + secondUserId + "/send",
                body);

        Assertions.assertEquals(400, response.statusCode());
    }

    @Test
    @DisplayName("Test sending a message to myself")
    void testSendMessageToSelf() throws Exception {
        body.put("conversationId", null);
        body.put("content", "Hello World");

        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/message/" + firstUserId + "/send",
                body);

        Assertions.assertEquals(400, response.statusCode());
    }

    @Test
    @DisplayName("Test getting conversations")
    void testGetConversation() throws Exception {
        body.put("conversationId", null);
        body.put("content", "Seed conversation");

        HttpResponse<String> seedResponse = post(CONNECTHUB_URL, "/api/message/" + secondUserId + "/send", body);
        Assertions.assertEquals(201, seedResponse.statusCode());
        String seededConversationId = objectMapper.readTree(seedResponse.body()).get("conversationId").asText();

        HttpResponse<String> response = get(CONNECTHUB_URL, "/api/message/conversation/");

        Assertions.assertEquals(200, response.statusCode());
        var jsonResponse = objectMapper.readTree(response.body());
        Assertions.assertNotNull(jsonResponse);
        Assertions.assertTrue(jsonResponse.isArray());
        Assertions.assertTrue(jsonResponse.size() >= 1);

        boolean containsSeededConversation = false;
        for (var conversation : jsonResponse) {
            if (seededConversationId.equals(conversation.get("id").asText())) {
                containsSeededConversation = true;
                break;
            }
        }
        Assertions.assertTrue(containsSeededConversation,
                "Expected conversation list to include seeded conversation " + seededConversationId);
    }

    @Test
    @DisplayName("Test get conversation messages")
    void testGetConversationMessages() throws Exception {
        body.put("conversationId", null);
        body.put("content", "Hello World");

        HttpResponse<String> sendMessageResponse = post(CONNECTHUB_URL, "/api/message/" + secondUserId + "/send", body);
        Assertions.assertEquals(201, sendMessageResponse.statusCode());

        var jsonResponse = sendMessageResponse.body();
        Assertions.assertNotNull(jsonResponse);
        String conversationId = objectMapper.readTree(jsonResponse).get("conversationId").asText();

        Assertions.assertNotNull(conversationId);

        HttpResponse<String> getMessageResponse = get(CONNECTHUB_URL, "/api/message/conversation/" + conversationId);
        Assertions.assertEquals(200, getMessageResponse.statusCode());

        var jsonMessageResponse = objectMapper.readTree(getMessageResponse.body());
        Assertions.assertNotNull(jsonMessageResponse);
        Assertions.assertTrue(jsonMessageResponse.isArray());
        Assertions.assertTrue(jsonMessageResponse.size() >= 1);
        Assertions.assertEquals("Seed conversation", jsonMessageResponse.get(0).get("content").asText());
        Assertions.assertEquals("Hello World", jsonMessageResponse.get(1).get("content").asText());
        Assertions.assertEquals(firstUserId, jsonMessageResponse.get(0).get("senderId").asText());

    }

}
