package com.uniflow.registration.util;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

public final class MongoConnection {
    private static final String MONGO_URI = System.getenv().getOrDefault("MONGO_URI", "mongodb://localhost:27017");
    private static final String DB_NAME = System.getenv().getOrDefault("MONGO_DB_NAME", "uniflowevents");

    private static final MongoClient CLIENT = MongoClients.create(MONGO_URI);

    private MongoConnection() {
    }

    public static MongoDatabase getDatabase() {
        return CLIENT.getDatabase(DB_NAME);
    }
}
