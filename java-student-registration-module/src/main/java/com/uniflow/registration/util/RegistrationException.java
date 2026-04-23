package com.uniflow.registration.util;

public class RegistrationException extends Exception {
    public RegistrationException(String message) {
        super(message);
    }
    
    public RegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
