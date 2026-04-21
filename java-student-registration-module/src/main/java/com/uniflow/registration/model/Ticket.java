package com.uniflow.registration.model;

import org.bson.Document;

import java.time.Instant;
import java.util.Date;

public class Ticket {
    public String ticketId;
    public String eventId;
    public String userId;
    public String eventTitle;
    public Date date;
    public String venue;
    public String studentName;
    public String ticketType;
    public String paymentStatus;
    public String qrCode;

    public Document toDocument() {
        return new Document("ticketId", ticketId)
            .append("eventId", eventId)
            .append("userId", userId)
            .append("eventTitle", eventTitle)
            .append("date", date)
            .append("venue", venue)
            .append("studentName", studentName)
            .append("ticketType", ticketType)
            .append("paymentStatus", paymentStatus)
            .append("qrCode", qrCode)
            .append("createdAt", Date.from(Instant.now()));
    }
}
