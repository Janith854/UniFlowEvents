<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head>
    <title>Student Event Registration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fb; margin: 0; }
        .wrap { max-width: 760px; margin: 30px auto; background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; }
        h2 { margin-top: 0; }
        .grid { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
        .full { grid-column: 1 / -1; }
        label { font-size: 13px; font-weight: 600; color: #374151; }
        input, select { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 6px; }
        .section { margin-top: 18px; border-top: 1px solid #eef2f7; padding-top: 16px; }
        .ticket-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
        .btn { background: #2563eb; color: #fff; border: 0; border-radius: 8px; padding: 10px 14px; font-weight: 600; cursor: pointer; }
        .btn[disabled] { opacity: .5; cursor: not-allowed; }
        .btn-secondary { background: #14b8a6; }
        .alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; }
        .error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .ok { background: #ecfeff; color: #0f766e; border: 1px solid #99f6e4; }
        .meta { color: #4b5563; font-size: 14px; }
        @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<div class="wrap">
    <h2>Student Event Registration</h2>
    <p class="meta">
        Event: <strong>${event.title}</strong><br/>
        Date: ${event.date}<br/>
        Venue: ${event.venue}<br/>
        Remaining Seats:
        <c:choose>
            <c:when test="${remainingSeats == 2147483647}">Unlimited</c:when>
            <c:otherwise>${remainingSeats}</c:otherwise>
        </c:choose>
    </p>

    <c:if test="${not empty error}">
        <div class="alert error">${error}</div>
    </c:if>

    <form
        method="post"
        action="${pageContext.request.contextPath}/student/register-event"
        id="registrationForm"
        data-has-tickets="${hasTickets}"
        data-regular-price="${event.tickets.regularPrice}"
        data-vip-price="${event.tickets.vipPrice}"
    >
        <input type="hidden" name="eventId" value="${eventId}"/>

        <div class="grid">
            <div>
                <label>Full Name *</label>
                <input type="text" name="fullName" required />
            </div>
            <div>
                <label>Email Address *</label>
                <input type="email" name="email" required />
            </div>

            <div>
                <label>Phone Number</label>
                <input type="text" name="phone" />
            </div>
            <div>
                <label>Department / Faculty</label>
                <input type="text" name="department" />
            </div>

            <div>
                <label>Year of Study</label>
                <select name="year">
                    <option value="">Select Year</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="4th">4th</option>
                </select>
            </div>

            <div>
                <label>Student ID / User ID *</label>
                <input type="text" name="userId" required placeholder="logged-in user id or mock id" />
            </div>
        </div>

        <c:set var="hasTickets" value="${event.tickets.hasTickets}" />
        <c:choose>
            <c:when test="${hasTickets}">
                <div class="section" id="paymentSection" style="display: block;">
                    <div class="ticket-block">
                        <strong>Ticket Selection</strong>
                        <div class="grid" style="margin-top:8px;">
                            <div>
                                <label>Ticket Type</label>
                                <select name="ticketType" id="ticketType">
                                    <option value="Regular">Regular Ticket</option>
                                    <option value="VIP">VIP Ticket</option>
                                </select>
                            </div>
                            <div>
                                <label>Price</label>
                                <input type="text" id="ticketPrice" readonly />
                            </div>
                        </div>
                        <input type="hidden" name="paymentStatus" id="paymentStatus" value="Pending" />
                        <div style="margin-top:10px; display:flex; gap:8px; align-items:center;">
                            <button type="button" class="btn btn-secondary" id="payBtn">Pay Now (Demo)</button>
                            <span id="paymentBadge" class="meta">Payment: Pending</span>
                        </div>
                    </div>
                </div>
            </c:when>
            <c:otherwise>
                <div class="section" id="paymentSection" style="display: none;">
                    <div class="ticket-block">
                        <strong>Ticket Selection</strong>
                        <div class="grid" style="margin-top:8px;">
                            <div>
                                <label>Ticket Type</label>
                                <select name="ticketType" id="ticketType">
                                    <option value="Regular">Regular Ticket</option>
                                    <option value="VIP">VIP Ticket</option>
                                </select>
                            </div>
                            <div>
                                <label>Price</label>
                                <input type="text" id="ticketPrice" readonly />
                            </div>
                        </div>
                        <input type="hidden" name="paymentStatus" id="paymentStatus" value="Pending" />
                        <div style="margin-top:10px; display:flex; gap:8px; align-items:center;">
                            <button type="button" class="btn btn-secondary" id="payBtn">Pay Now (Demo)</button>
                            <span id="paymentBadge" class="meta">Payment: Pending</span>
                        </div>
                    </div>
                </div>
            </c:otherwise>
        </c:choose>

        <div class="section">
            <c:choose>
                <c:when test="${eventFull}">
                    <button type="submit" class="btn" id="submitBtn" disabled>Register</button>
                    <span class="alert error" style="display:inline-block; margin-left: 8px;">Event is full.</span>
                </c:when>
                <c:otherwise>
                    <button type="submit" class="btn" id="submitBtn">Register</button>
                </c:otherwise>
            </c:choose>
        </div>
    </form>
</div>

<script>
    (function () {
        const form = document.getElementById('registrationForm');
        const hasTickets = String(form.dataset.hasTickets) === 'true';
        if (!hasTickets) return;

        const regularPrice = Number(form.dataset.regularPrice || 0);
        const vipPrice = Number(form.dataset.vipPrice || 0);

        const ticketType = document.getElementById('ticketType');
        const ticketPrice = document.getElementById('ticketPrice');
        const payBtn = document.getElementById('payBtn');
        const paymentStatus = document.getElementById('paymentStatus');
        const paymentBadge = document.getElementById('paymentBadge');

        function updatePrice() {
            const isVip = ticketType.value === 'VIP';
            ticketPrice.value = 'LKR ' + (isVip ? vipPrice : regularPrice).toFixed(2);
        }

        ticketType.addEventListener('change', updatePrice);
        payBtn.addEventListener('click', function () {
            payBtn.disabled = true;
            payBtn.textContent = 'Processing...';

            setTimeout(function () {
                paymentStatus.value = 'Paid';
                paymentBadge.textContent = 'Payment: Paid';
                paymentBadge.style.color = '#0f766e';
                payBtn.textContent = 'Paid';
            }, 900);
        });

        form.addEventListener('submit', function (e) {
            if (paymentStatus.value !== 'Paid') {
                e.preventDefault();
                alert('Please click "Pay Now (Demo)" first.');
            }
        });

        updatePrice();
    })();
</script>
</body>
</html>
