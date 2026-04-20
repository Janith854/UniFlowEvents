const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter.
 * - In production: uses SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS from .env
 * - In development fallback: generates a temporary Ethereal test account
 *   NOTE: Ethereal emails are never delivered to real inboxes. Use real SMTP for prod.
 */
const createTransporter = async () => {
    // If real SMTP credentials are configured, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for others
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Development fallback: use Ethereal (emails are NOT delivered, only previewable)
    console.warn(
        '⚠️  [emailService] No SMTP credentials in .env — falling back to Ethereal test account. ' +
        'Emails will NOT be delivered to real inboxes. Set SMTP_HOST, SMTP_USER, SMTP_PASS for production.'
    );
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

const FROM_ADDRESS = process.env.EMAIL_FROM || '"UniFlow Events" <noreply@uniflow.local>';

exports.sendBulkInvitations = async (emails, eventTitle, eventDate, eventLocation) => {
    const transporter = await createTransporter();

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
        from: FROM_ADDRESS,
        to: emails.join(', '),
        subject: `Invitation to ${eventTitle}`,
        text: `You are invited to an upcoming event: ${eventTitle} at ${eventLocation} on ${new Date(eventDate).toLocaleString()}.`,
        html: htmlContent,
    });

    console.log('Message sent: %s', info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('Preview URL: %s', previewUrl);
    return previewUrl || null;
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = await createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const htmlContent = `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click the following link to complete the process (valid for 1 hour):</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    const info = await transporter.sendMail({
        from: FROM_ADDRESS,
        to: email,
        subject: 'UniFlow Events — Password Reset Request',
        html: htmlContent,
    });

    console.log('Password Reset Email sent: %s', info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('Preview URL: %s', previewUrl);
    return previewUrl || null;
};
