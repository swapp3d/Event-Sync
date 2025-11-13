package org.swap.eventsync.util;

/**
 * Rough token estimation. 1 token ≈ 4 characters,
 * which is sufficient for keeping Hugging Face model safe (had some troubles with that).
 */
public class TokenUtils {

    private static final double CHARS_PER_TOKEN = 4.0;

    public static int estimateTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        return (int) Math.ceil(text.length() / CHARS_PER_TOKEN);
    }

    public static String trimToTokenLimit(String text, int maxTokens) {
        if (text == null) return "";
        int maxChars = (int) (maxTokens * CHARS_PER_TOKEN);
        if (text.length() <= maxChars) return text;
        return text.substring(0, maxChars);
    }
}
