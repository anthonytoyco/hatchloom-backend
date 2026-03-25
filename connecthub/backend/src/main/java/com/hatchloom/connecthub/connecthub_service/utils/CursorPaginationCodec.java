package com.hatchloom.connecthub.connecthub_service.utils;
import java.util.Base64;
import java.util.function.BiFunction;

public class CursorPaginationCodec {

    public static String encodeCursor(Integer id, String createdAt) {
        String cursorData = id + "|" + createdAt;
        return Base64.getEncoder().encodeToString(cursorData.getBytes());
    }

    public static <T extends CursorPayload> T decodeCursor(String cursor, BiFunction<String, Integer, T> payloadBiFunction) {
        try {
            byte[] decoded = Base64.getDecoder().decode(cursor);
            String decodedString = new String(decoded);
            String[] parts = decodedString.split("\\|");

            if (parts.length != 2) {
                throw new IllegalArgumentException("Invalid cursor format");
            }

            Integer id = Integer.parseInt(parts[0]);
            String createdAt = parts[1];

            return payloadBiFunction.apply(createdAt, id);
        }
        catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Failed to decode cursor: " + e.getMessage());
        }
    }
}
