import { config } from "./env.js";

/**
 * Send transactional email using Brevo HTTPS REST API
 * (Bypasses cloud port blocks, zero domain restrictions, fast delivery)
 */
export const sendEmail = async ({ to, subject, html }) => {
    if (!config.brevoApiKey) {
        throw new Error("BREVO_API_KEY is not configured in environment variables.");
    }

    const recipientsList = (Array.isArray(to) ? to : [to]).map(email => ({
        email: email.trim()
    }));

    const senderEmail = config.email.senderEmail;
    const senderName = config.email.senderName;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": config.brevoApiKey,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: recipientsList,
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
};
