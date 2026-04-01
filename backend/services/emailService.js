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
