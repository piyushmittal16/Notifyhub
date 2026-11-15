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

    // 💌 Email Config yaha daalo:
    resendApiKey: process.env.RESEND_API_KEY || '',
    email: {
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        from: process.env.EMAIL_FROM || 'NotifyHub <onboarding@resend.dev>'
    }
};