import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
            select: false // Default query me password nahi aayega (Security)
        },
        role: {
            type: String,
            enum: {
                values: ['developer', 'admin'],
                message: 'Role must be either developer or admin'
            },
            default: 'developer'
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'blocked'],
                message: 'Status must be either active or blocked'
            },
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);
// 🔒 Save hone se pehle password automatically hash karo
userSchema.pre('save', async function () {
    // Agar password modify nahi hua (e.g. sirf name update hua), toh dobara hash mat karo
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

export const User = mongoose.model('User', userSchema);