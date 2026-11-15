import { config } from "./env.js";

/**
 * Strips HTML tags to generate a clean plain-text fallback for email clients.
 * Multi-part MIME (both HTML and text) drastically reduces spam scores.
 */
const htmlToPlainText = (html = "") => {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

/**
 * Ensures the HTML has standard DOCTYPE and email headers so spam filters
 * don't penalize raw, naked HTML snippets.
 */
const formatEmailHtml = (content = "", subject = "") => {
    if (content.toLowerCase().includes("<!doctype html")) {
        return content;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    ${content}
    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0 16px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
      Sent securely via <strong>NotifyHub</strong> transactional email platform.
    </p>
  </div>
</body>
</html>`;
};

/**
 * Send transactional email using Brevo HTTPS REST API
 * (Bypasses cloud port blocks, zero domain restrictions, anti-spam optimized)
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
    const formattedHtml = formatEmailHtml(html, subject);
    const plainText = htmlToPlainText(html);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": config.brevoApiKey,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            replyTo: { name: senderName, email: senderEmail },
            to: recipientsList,
            subject,
            htmlContent: formattedHtml,
            textContent: plainText,
            headers: {
                "X-Mailin-Tag": "transactional"
            }
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
