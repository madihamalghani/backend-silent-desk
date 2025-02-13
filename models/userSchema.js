import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters long'],
            maxlength: [20, 'Username must not exceed 20 characters']
        },
        email: {
            type: String,
            required: true,
            unique: true, 
            trim: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: true,
            minlength: [6, 'Password length must be at least 6 characters'],
            maxlength: [20, 'Password must not exceed 20 characters'],
            select: false // Prevents password from being returned in queries
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        }
    }
);

// 🔹 **Hash password before saving**
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔹 **Compare password method**
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 🔹 **Generate JWT token**
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Export the model
export const User = mongoose.model('User', userSchema);
