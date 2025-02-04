const mongoose = require("mongoose");

const joinRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    }
});

export const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);