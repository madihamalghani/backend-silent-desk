import mongoose from 'mongoose';
// user admission in class
const classMembershipSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        // This is the display name within the class.
        // It must be unique per class, but different classes can have the same display name.
        classDisplayName: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user"
        },
        status: {  // 🔥 New field for approval
            type: String,
            enum: ["pending", "approved","rejected"],
            default: "pending"
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        }

    }
);
// Create a compound index to ensure that for any given class,
// no two memberships have the same classDisplayName.
classMembershipSchema.index({ classId: 1, classDisplayName: 1 }, { unique: true });
export const Membership = mongoose.model("Membership",classMembershipSchema);
