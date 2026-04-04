package com.system.tests.message;

import com.system.tests.base.BaseSystemTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.http.HttpResponse;
import java.util.HashMap;

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
        HttpResponse<String> response = get(CONNECTHUB_URL, "/api/message/conversation/");

        Assertions.assertEquals(200, response.statusCode());
        var jsonResponse = objectMapper.readTree(response.body());
        Assertions.assertNotNull(jsonResponse);

        // 1 is from the first test since it was never deleted
        Assertions.assertEquals(1, jsonResponse.size());
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
        Assertions.assertTrue(jsonMessageResponse.size() >= 2);

    }


}
