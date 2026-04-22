package com.uniflow.registration.servlet;

import com.uniflow.registration.model.Registration;
import com.uniflow.registration.model.Ticket;
import com.uniflow.registration.repository.EventRepository;
import com.uniflow.registration.repository.RegistrationRepository;
import com.uniflow.registration.repository.TicketRepository;
import com.uniflow.registration.util.QrCodeUtil;
import com.uniflow.registration.util.TicketIdGenerator;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.uniflow.registration.util.RegistrationException;

import java.io.IOException;
import java.time.Instant;
import java.util.Date;

@WebServlet("/student/register-event")
public class StudentEventRegistrationServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(StudentEventRegistrationServlet.class);
    private final EventRepository eventRepository = new EventRepository();
    private final RegistrationRepository registrationRepository = new RegistrationRepository();
    private final TicketRepository ticketRepository = new TicketRepository();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String eventId = req.getParameter("eventId");
        if (eventId == null || eventId.isBlank()) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "eventId is required");
            return;
        }

        Document event = eventRepository.findById(eventId);
        if (event == null) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Event not found");
            return;
        }

        int remainingSeats = calculateRemainingSeats(event);
        req.setAttribute("event", event);
        req.setAttribute("eventId", eventId);
        req.setAttribute("remainingSeats", remainingSeats);
        req.setAttribute("eventFull", remainingSeats == 0);

        req.getRequestDispatcher("/WEB-INF/views/register-event.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String eventId = req.getParameter("eventId");
        String userId = req.getParameter("userId");
        logger.info("Processing registration request for userId: {} and eventId: {}", userId, eventId);

        Document event = eventRepository.findById(eventId);
        if (event == null) {
            fail(req, resp, "Event not found");
            return;
        }

        String fullName = param(req, "fullName");
        String email = param(req, "email");
        String phone = param(req, "phone");
        String department = param(req, "department");
        String year = param(req, "year");

        try {
            validateRequest(event, fullName, email, userId, eventId);
        } catch (RegistrationException e) {
            fail(req, resp, e.getMessage());
            return;
        }

        boolean hasTickets = hasTickets(event);
        String ticketType = hasTickets ? param(req, "ticketType") : "FREE";
        String paymentStatus = hasTickets ? param(req, "paymentStatus") : "Paid";

        if (hasTickets) {
            if (!"Regular".equals(ticketType) && !"VIP".equals(ticketType)) {
                fail(req, resp, "Please select a ticket type.");
                return;
            }
            if (!"Paid".equals(paymentStatus)) {
                fail(req, resp, "Demo payment required for paid events.");
                return;
            }
        }

        if (!eventRepository.incrementRegisteredCountIfAvailable(eventId, event)) {
            fail(req, resp, "Event capacity was reached. Please refresh and try again.");
            return;
        }

        Registration registration = new Registration();
        registration.eventId = eventId;
        registration.userId = userId;
        registration.name = fullName;
        registration.email = email;
        registration.phone = phone;
        registration.department = department;
        registration.year = year;
        registration.ticketType = ticketType;
        registration.paymentStatus = paymentStatus;
        registrationRepository.insert(registration);

        Ticket ticket = new Ticket();
        ticket.ticketId = TicketIdGenerator.nextTicketId();
        ticket.eventId = eventId;
        ticket.userId = userId;
        ticket.eventTitle = event.getString("title");
        ticket.date = event.getDate("date");
        ticket.venue = event.getString("venue");
        ticket.studentName = fullName;
        ticket.ticketType = ticketType;
        ticket.paymentStatus = paymentStatus;

        try {
            String qrPayload = ticket.ticketId + "|" + eventId + "|" + fullName + "|" + ticket.ticketType;
            ticket.qrCode = QrCodeUtil.toBase64Png(qrPayload);
        } catch (Exception exception) {
            fail(req, resp, "Failed to generate QR code.");
            return;
        }

        ticketRepository.insert(ticket);
        logger.info("Successfully registered user {} for event {}. Ticket ID: {}", userId, eventId, ticket.ticketId);

        req.setAttribute("success", "Registration successful.");
        req.setAttribute("ticket", ticket);
        req.getRequestDispatcher("/WEB-INF/views/ticket-success.jsp").forward(req, resp);
    }

    private void fail(HttpServletRequest req, HttpServletResponse resp, String message) throws ServletException, IOException {
        String eventId = req.getParameter("eventId");
        Document event = eventRepository.findById(eventId);
        req.setAttribute("event", event);
        req.setAttribute("eventId", eventId);
        req.setAttribute("error", message);
        req.setAttribute("remainingSeats", event == null ? 0 : calculateRemainingSeats(event));
        req.setAttribute("eventFull", event != null && calculateRemainingSeats(event) == 0);
        req.getRequestDispatcher("/WEB-INF/views/register-event.jsp").forward(req, resp);
    }

    private String param(HttpServletRequest req, String key) {
        String val = req.getParameter(key);
        return val == null ? "" : val.trim();
    }

    private boolean hasTickets(Document event) {
        Document tickets = event.get("tickets", Document.class);
        return tickets != null && Boolean.TRUE.equals(tickets.getBoolean("hasTickets"));
    }

    private boolean isEventPublished(Document event) {
        String status = event.getString("status");
        return "UPCOMING".equalsIgnoreCase(status) || "ONGOING".equalsIgnoreCase(status) || "Published".equalsIgnoreCase(status);
    }

    private boolean isDeadlinePassed(Document event) {
        Date deadline = event.getDate("registrationDeadline");
        return deadline != null && deadline.toInstant().isBefore(Instant.now());
    }

    private boolean isCapacityExceeded(Document event) {
        String capacityType = event.getString("capacityType");
        if (!"Limited".equalsIgnoreCase(capacityType)) {
            return false;
        }

        int capacity = event.getInteger("capacity", 0);
        int registeredCount = event.getInteger("registeredCount", 0);
        return registeredCount >= capacity;
    }

    private int calculateRemainingSeats(Document event) {
        String capacityType = event.getString("capacityType");
        if (!"Limited".equalsIgnoreCase(capacityType)) {
            return Integer.MAX_VALUE;
        }

        int capacity = event.getInteger("capacity", 0);
        int registeredCount = event.getInteger("registeredCount", 0);
        return Math.max(0, capacity - registeredCount);
    }

    private void validateRequest(Document event, String fullName, String email, String userId, String eventId) throws RegistrationException {
        if (fullName.isBlank() || email.isBlank()) {
            throw new RegistrationException("Full Name and Email are required.");
        }
        if (!isEventPublished(event)) {
            throw new RegistrationException("Event is not published.");
        }
        if (isDeadlinePassed(event)) {
            throw new RegistrationException("Registration deadline has passed.");
        }
        if (isCapacityExceeded(event)) {
            throw new RegistrationException("Event capacity is full.");
        }
        if (registrationRepository.existsByUserAndEvent(userId, eventId)) {
            throw new RegistrationException("Duplicate registration is not allowed.");
        }
    }
}
