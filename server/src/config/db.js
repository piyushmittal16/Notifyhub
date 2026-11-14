import mongoose from 'mongoose';
import dns from 'dns';
import { config } from './env.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};