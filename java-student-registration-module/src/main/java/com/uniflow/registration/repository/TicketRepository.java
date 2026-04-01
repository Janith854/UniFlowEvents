package com.uniflow.registration.repository;

import com.mongodb.client.MongoCollection;
import com.uniflow.registration.model.Ticket;
import com.uniflow.registration.util.MongoConnection;
import org.bson.Document;

import static com.mongodb.client.model.Filters.eq;

public class TicketRepository {
    private final MongoCollection<Document> tickets = MongoConnection.getDatabase().getCollection("tickets");

    public void insert(Ticket ticket) {
        tickets.insertOne(ticket.toDocument());
    }

    public Document findByTicketId(String ticketId) {
        return tickets.find(eq("ticketId", ticketId)).first();
    }
}
