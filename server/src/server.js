import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
import mongoose from "mongoose";

// 🚨 Catch any synchronous unhandled exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err.name, err.message, err.stack);
    process.exit(1);
});

const startServer = async () => {
    await connectDB();

    const server = app.listen(config.port, () => {
        console.log(`🚀 Server running in ${config.env} mode on http://localhost:${config.port}`);
    });

    // 🛡️ Graceful Shutdown Handler
    const shutdown = async (signal) => {
        console.log(`\n🛑 ${signal} received. Closing HTTP server & MongoDB connections gracefully...`);
        server.close(async () => {
            console.log('✅ HTTP server closed. No new requests will be accepted.');
            await mongoose.connection.close(false);
            console.log('✅ MongoDB connection closed.');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('⚠️ Forcefully shutting down after timeout.');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // 🚨 Catch any unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...', err.name, err.message);
        shutdown('UNHANDLED_REJECTION');
    });
};

startServer();