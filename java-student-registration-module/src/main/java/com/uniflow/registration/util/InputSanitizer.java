package com.uniflow.registration.util;

public class InputSanitizer {
    public static String sanitize(String input) {
        if (input == null) return "";
        return input.trim()
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#x27;");
    }
}
