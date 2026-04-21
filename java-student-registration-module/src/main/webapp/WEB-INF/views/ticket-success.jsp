<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Ticket Generated</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; }
        .ticket { max-width: 680px; margin: 30px auto; background: #fff; border: 1px solid #dbeafe; border-radius: 14px; padding: 24px; }
        .ok { color: #065f46; font-weight: 700; margin-bottom: 12px; }
        .row { display: flex; justify-content: space-between; gap: 14px; margin: 8px 0; flex-wrap: wrap; }
        .label { color: #6b7280; font-size: 13px; }
        .value { font-size: 15px; font-weight: 600; color: #111827; }
        .qr { text-align: center; margin-top: 16px; }
        .actions { margin-top: 18px; display: flex; gap: 10px; }
        .btn { border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; background: #fff; cursor: pointer; }
    </style>
</head>
<body>
<div class="ticket" id="ticketCard">
    <div class="ok">${success}</div>
    <h2>Digital Ticket</h2>

    <div class="row"><div><div class="label">Ticket ID</div><div class="value">${ticket.ticketId}</div></div></div>
    <div class="row"><div><div class="label">Event Title</div><div class="value">${ticket.eventTitle}</div></div></div>
    <div class="row">
        <div><div class="label">Date & Time</div><div class="value">${ticket.date}</div></div>
        <div><div class="label">Venue</div><div class="value">${ticket.venue}</div></div>
    </div>
    <div class="row">
        <div><div class="label">Student Name</div><div class="value">${ticket.studentName}</div></div>
        <div><div class="label">Ticket Type</div><div class="value">${ticket.ticketType}</div></div>
        <div><div class="label">Payment</div><div class="value">${ticket.paymentStatus}</div></div>
    </div>

    <div class="qr">
        <img src="data:image/png;base64,${ticket.qrCode}" alt="Ticket QR Code" />
    </div>

    <div class="actions">
        <a class="btn" href="${pageContext.request.contextPath}/student/ticket/pdf?ticketId=${ticket.ticketId}">Download Ticket (PDF)</a>
        <button class="btn" onclick="window.print()">Print Ticket</button>
        <button class="btn" onclick="window.history.back()">Back</button>
    </div>
</div>
</body>
</html>
