import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    let transporter;

    // 1) Create a transporter
    if (process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        // Use provided SMTP credentials
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    } else {
        // Use Ethereal Email for development/testing if no SMTP provided
        const testAccount = await nodemailer.createTestAccount();

        console.log('Using Ethereal Email for testing');
        console.log(`Ethereal User: ${testAccount.user}`);
        console.log(`Ethereal Pass: ${testAccount.pass}`);

        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    // 2) Define email options
    const mailOptions = {
        from: process.env.SMTP_EMAIL ? `Tracklify <${process.env.SMTP_EMAIL}>` : 'Tracklify <noreply@tracklify.com>',
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text, // Fallback for clients that don't support HTML
    };

    // 3) Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);

    // If using Ethereal, log the preview URL
    if (!process.env.SMTP_HOST) {
        console.log('---------------------------------------------------');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('---------------------------------------------------');
    }
};

export default sendEmail;
