package com.uniflow.registration.model;

import com.uniflow.registration.util.RegistrationStatus;

import org.bson.Document;

import java.time.Instant;
import java.util.Date;

public class Registration {
    public String eventId;
    public String userId;
    public String name;
    public String email;
    public String phone;
    public String department;
    public String year;
    public String ticketType;
    public String paymentStatus;
    public RegistrationStatus status = RegistrationStatus.PENDING;

    public Document toDocument() {
        return new Document("eventId", eventId)
            .append("userId", userId)
            .append("name", name)
            .append("email", email)
            .append("phone", phone)
            .append("department", department)
            .append("year", year)
            .append("ticketType", ticketType)
            .append("paymentStatus", paymentStatus)
            .append("status", status.name())
            .append("createdAt", Date.from(Instant.now()));
    }
}
