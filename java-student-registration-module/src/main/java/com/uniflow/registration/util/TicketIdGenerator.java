package com.uniflow.registration.util;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.FindOneAndUpdateOptions;
import com.mongodb.client.model.ReturnDocument;
import org.bson.Document;

import java.time.Year;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.combine;
import static com.mongodb.client.model.Updates.inc;
import static com.mongodb.client.model.Updates.setOnInsert;

public final class TicketIdGenerator {
    private TicketIdGenerator() {
    }

    public static String nextTicketId() {
        int year = Year.now().getValue();
        String counterKey = "ticket-" + year;

        MongoCollection<Document> counters = MongoConnection.getDatabase().getCollection("counters");

        Document updated = counters.findOneAndUpdate(
            eq("_id", counterKey),
            combine(
                setOnInsert("year", year),
                inc("seq", 1)
            ),
            new FindOneAndUpdateOptions().upsert(true).returnDocument(ReturnDocument.AFTER)
        );

        int seq = updated.getInteger("seq", 1);
        return String.format("EVT-%d-%06d", year, seq);
    }
}
