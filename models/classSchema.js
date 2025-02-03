import mongoose from 'mongoose';
// making class
const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: [4, 'Class Name must contain atleast 4 characters '],
        maxlength: [60, 'Class Name must not contain more than 60 characters']
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: [4, 'Class Name must contain atleast 4 characters '],
        maxlength: [200, 'Class Name must not contain more than 200 characters']
    },
    category: String,
    classCode: {
        type: String,
        required: true,
        unique: true, // Globally unique class code
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // role: {
    //     type: String,
    //     enum: ["admin", "user"],
    //     default: "admin"
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("Class", classSchema);
