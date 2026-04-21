package com.uniflow.registration.servlet;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.uniflow.registration.repository.TicketRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;

@WebServlet("/student/ticket/pdf")
public class TicketPdfServlet extends HttpServlet {
    private final TicketRepository ticketRepository = new TicketRepository();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String ticketId = req.getParameter("ticketId");
        if (ticketId == null || ticketId.isBlank()) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ticketId is required");
            return;
        }

        org.bson.Document ticket = ticketRepository.findByTicketId(ticketId);
        if (ticket == null) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Ticket not found");
            return;
        }

        resp.setContentType("application/pdf");
        resp.setHeader("Content-Disposition", "attachment; filename=Ticket-" + ticketId + ".pdf");

        PdfWriter writer = new PdfWriter(resp.getOutputStream());
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);

        doc.add(new Paragraph("University Event Ticket")
            .setBold()
            .setFontSize(20)
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(ColorConstants.BLUE));

        doc.add(new Paragraph(" "));
        doc.add(row("Event Title", ticket.getString("eventTitle")));
        doc.add(row("Date & Time", formatDate(ticket.getDate("date"))));
        doc.add(row("Venue", ticket.getString("venue")));
        doc.add(row("Student Name", ticket.getString("studentName")));
        doc.add(row("Ticket Type", ticket.getString("ticketType")));
        doc.add(row("Unique Ticket ID", ticket.getString("ticketId")));

        String qrBase64 = ticket.getString("qrCode");
        if (qrBase64 != null && !qrBase64.isBlank()) {
            byte[] qrBytes = Base64.getDecoder().decode(qrBase64);
            Image qrImage = new Image(ImageDataFactory.create(qrBytes));
            qrImage.setAutoScale(true);
            qrImage.setWidth(130);
            qrImage.setMarginTop(12);
            doc.add(new Paragraph("QR Code").setBold().setMarginTop(12));
            doc.add(qrImage);
        }

        doc.close();
    }

    private Paragraph row(String label, String value) {
        return new Paragraph(label + ": " + (value == null ? "-" : value)).setFontSize(12).setMarginBottom(6);
    }

    private String formatDate(Date date) {
        if (date == null) return "-";
        return new SimpleDateFormat("yyyy-MM-dd HH:mm").format(date);
    }
}
