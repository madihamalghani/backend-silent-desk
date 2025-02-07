import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null  // Anonymous messages have no sender
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        read: {
            type: Boolean,
            default: false  // Initially, a message is unread
        },
        isAnonymous: {
            type: Boolean,
            default: false  // This will be true for anonymous messages
        }
    },
    { timestamps: true }  // Auto-adds createdAt & updatedAt timestamps
);

export const Message = mongoose.model("Message", messageSchema);