import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema(
    {
        // receiverId
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        // Optional: store sender info for moderation without exposing it to users
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    }
);
export const Message=mongoose.model("Message", messageSchema);

