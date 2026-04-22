package com.uniflow.registration.repository;

import com.uniflow.registration.util.RegistrationStatus;

import com.mongodb.client.MongoCollection;
import com.uniflow.registration.model.Registration;
import com.uniflow.registration.util.MongoConnection;
import org.bson.Document;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

import java.util.ArrayList;
import java.util.List;
import com.mongodb.client.FindIterable;

public class RegistrationRepository {
    private final MongoCollection<Document> registrations = MongoConnection.getDatabase().getCollection("registrations");

    public List<Document> findAllByUserId(String userId) {
        FindIterable<Document> docs = registrations.find(eq("userId", userId));
        List<Document> list = new ArrayList<>();
        docs.forEach(list::add);
        return list;
    }

    public boolean existsByUserAndEvent(String userId, String eventId) {
        return registrations.find(and(eq("userId", userId), eq("eventId", eventId))).first() != null;
    }

    public Document findById(String id) {
        return registrations.find(eq("_id", id)).first();
    }

    public void insert(Registration registration) {
        registrations.insertOne(registration.toDocument());
    }

    public boolean updateStatus(String registrationId, RegistrationStatus status) {
        return registrations.updateOne(eq("_id", registrationId), new Document("$set", new Document("status", status.name()))).getModifiedCount() > 0;
    }
}
