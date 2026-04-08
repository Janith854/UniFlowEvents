const nodemailer = require('nodemailer');

// Async function to create the transporter
const createTransporter = async () => {
    // Generate a test ethereal account
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
};

exports.sendBulkInvitations = async (emails, eventTitle, eventDate, eventLocation) => {
    const transporter = await createTransporter();
    
    // We can simulate an email to an array of recipients.
    // For ethereal, we can just join them or map over them
    const htmlContent = `
        <h1>Invitation: ${eventTitle}</h1>
        <p>You are invited to an upcoming event!</p>
        <ul>
            <li><strong>Date:</strong> ${new Date(eventDate).toLocaleString()}</li>
            <li><strong>Venue:</strong> ${eventLocation}</li>
        </ul>
        <p>We hope to see you there!</p>
    `;

    const info = await transporter.sendMail({
        from: '"CampusFlow Events" <noreply@campusflow.test>', 
        to: emails.join(', '), 
        subject: `Invitation to ${eventTitle}`,
        text: `You are invited to an upcoming event: ${eventTitle} at ${eventLocation} on ${new Date(eventDate).toLocaleString()}.`,
        html: htmlContent, 
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = await createTransporter();
    
    // In a real app, this would be your frontend URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const htmlContent = `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    const info = await transporter.sendMail({
        from: '"CampusFlow Support" <support@campusflow.test>', 
        to: email, 
        subject: 'CampusFlow Password Reset Request',
        html: htmlContent, 
    });

    console.log("Password Reset Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
};
