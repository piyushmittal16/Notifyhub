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
    // 1. If Resend API Key is provided, use Resend HTTP API (Render free tier friendly!)
    if (config.resendApiKey) {
        const client = resend || new Resend(config.resendApiKey);
        const fromAddress = config.email.from && !config.email.from.includes('notifyhub.com')
            ? config.email.from
            : 'NotifyHub <onboarding@resend.dev>';

        const { data, error } = await client.emails.send({
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
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

    // 2. Fallback to Nodemailer SMTP
    return transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html
    });
};
