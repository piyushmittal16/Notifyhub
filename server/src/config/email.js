import nodemailer from "nodemailer";
import { config } from "./env.js";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // Port 465 ho toh true, warna false
    auth: {
        user: config.email.user,
        pass: config.email.pass
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    return transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html
    });
}