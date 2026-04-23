package com.uniflow.registration.util;

import java.text.SimpleDateFormat;
import java.util.Date;

public class DateUtils {
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public static String format(Date date) {
        if (date == null) return "N/A";
        return DATE_FORMAT.format(date);
    }
}
