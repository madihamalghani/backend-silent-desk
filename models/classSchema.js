import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
        unique: true, // Class name must be unique across the app
        trim: true,
        minlength:[4,'Class name must contain 4 characters'],
        maxlength:[40,'Characters must not be more than 40']
    },
    description: {
        type: String,
        trim: true,
        minlength:[20,'Description must contain 20 digits'],
        maxlength:[150,'Characters must not be more than 150']
    },
    classCode: {
        type: String,
        required: true,
        unique: true // Unique class code for searching
    },
    category: {
        type: String,
        required: true,
        enum: ["Colleague", "Classmates", "Friends", "Other"]
    },
    admins: [  // 🔥 Allow multiple admins
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    }
],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
export const Class = mongoose.model("Class", classSchema);
