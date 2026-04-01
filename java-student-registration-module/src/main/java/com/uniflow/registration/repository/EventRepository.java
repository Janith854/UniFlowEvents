package com.uniflow.registration.repository;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.result.UpdateResult;
import com.uniflow.registration.util.MongoConnection;
import org.bson.Document;
import org.bson.types.ObjectId;
import static com.mongodb.client.model.Updates.inc;

import static com.mongodb.client.model.Filters.eq;

public class EventRepository {
    private final MongoCollection<Document> events = MongoConnection.getDatabase().getCollection("events");

    public Document findById(String eventId) {
        return events.find(eq("_id", new ObjectId(eventId))).first();
    }

    public boolean incrementRegisteredCountIfAvailable(String eventId, Document event) {
        Document filter;
        String capacityType = event.getString("capacityType");

        if ("Limited".equalsIgnoreCase(capacityType)) {
            int capacity = event.getInteger("capacity", 0);
            filter = new Document("_id", new ObjectId(eventId))
                .append("registeredCount", new Document("$lt", capacity));
        } else {
            filter = new Document("_id", new ObjectId(eventId));
        }

        UpdateResult result = events.updateOne(filter, inc("registeredCount", 1));
        return result.getModifiedCount() == 1;
    }
}
