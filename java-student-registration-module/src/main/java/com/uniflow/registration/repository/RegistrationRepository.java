package com.uniflow.registration.repository;

import com.mongodb.client.MongoCollection;
import com.uniflow.registration.model.Registration;
import com.uniflow.registration.util.MongoConnection;
import org.bson.Document;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

public class RegistrationRepository {
    private final MongoCollection<Document> registrations = MongoConnection.getDatabase().getCollection("registrations");

    public boolean existsByUserAndEvent(String userId, String eventId) {
        return registrations.find(and(eq("userId", userId), eq("eventId", eventId))).first() != null;
    }

    public void insert(Registration registration) {
        registrations.insertOne(registration.toDocument());
    }
}
