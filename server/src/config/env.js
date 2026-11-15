import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",

    // 💌 Email Configuration (Brevo HTTPS API)
    brevoApiKey: process.env.BREVO_API_KEY || '',
    email: {
        senderEmail: process.env.EMAIL_USER || 'piyushbharattapp@gmail.com',
        senderName: process.env.EMAIL_SENDER_NAME || 'NotifyHub'
    }
};
