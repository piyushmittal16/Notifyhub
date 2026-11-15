import nodemailer from "nodemailer";
import { Resend } from "resend";
import { config } from "./env.js";

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

// Fallback SMTP Transporter
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    const recipientsList = Array.isArray(to) ? to : [to];

    // 1. Priority 1: Brevo HTTPS REST API (Zero SMTP blocks, sends to ANY recipient worldwide without custom domain!)
    if (config.brevoApiKey) {
        const senderEmail = config.email.user || 'piyushbharattapp@gmail.com';
        const senderName = 'NotifyHub';

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': config.brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: recipientsList.map(email => ({ email: email.trim() })),
                subject,
                htmlContent: html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Brevo Delivery Error: ${data.message || JSON.stringify(data)}`);
        }

        return {
            messageId: data.messageId || `brevo_${Date.now()}`
        };
    }

    // 2. Priority 2: Resend HTTPS API (If configured)
    if (config.resendApiKey) {
        const client = resend || new Resend(config.resendApiKey);
        const fromAddress = config.email.from && !config.email.from.includes('notifyhub.com')
            ? config.email.from
            : 'NotifyHub <onboarding@resend.dev>';

        const { data, error } = await client.emails.send({
            from: fromAddress,
            to: recipientsList,
            subject,
            html
        });

        if (error) {
            throw new Error(`Resend Error: ${error.message}`);
        }

        return {
            messageId: data?.id || `resend_${Date.now()}`
        };
    }

    // 3. Fallback: Nodemailer SMTP
    return transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html
    });
};
