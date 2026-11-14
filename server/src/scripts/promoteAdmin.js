import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import dns from 'dns';

// Windows DNS fix for MongoDB SRV
dns.setServers(['8.8.8.8', '8.8.4.4']);

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide email: node src/scripts/promoteAdmin.js user@example.com');
    process.exit(1);
}

const promoteUser = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            console.error(`❌ User with email "${email}" not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`🎉 Success! User "${user.name}" (${user.email}) is now an ADMIN!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error promoting user:', error);
        process.exit(1);
    }
};

promoteUser();