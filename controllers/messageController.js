import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Message } from "../models/messageSchema.js";

// Function to create a message
export const createMessage = catchAsyncErrors(async (req, res, next) => {
    const { recipientId, classId, message, isAnonymous } = req.body;
    if (!recipientId || !classId || !message) {
        return next(new ErrorHandler("Recipient ID, Class ID, and Message are required", 400));
    }
    const newMessage = new Message({
        // senderId: isAnonymous ? null : req.user.id,
        // in order to send with sender id but flagged anonymous as true  
        senderId:req.user.id,
        recipientId,
        classId,
        message,
        isAnonymous
    });
    await newMessage.save();
    // Push the message to the recipient in real-time (if they are connected via socket)
    // io.to(recipientId).emit('newMessage', newMessage); // This sends the message to the recipient

    res.status(200).json({
        success: true,
        message: isAnonymous ? "Anonymous message sent" : "Message sent successfully"
    });
});
// --------------------------------------------------
// Function to get all messages for a class
export const getMessagesForClass = catchAsyncErrors(async (req, res, next) => {
    const { classId } = req.params;

    const messages = await Message.find({ classId })
        .populate("senderId", "name")  // Populate sender's name (if not anonymous)
        .populate("recipientId", "name");  // Populate recipient's name

    res.status(200).json({
        success: true,
        messages
    });
});
// -----------------------------get all messages for a specific user-----------
export const getMessagesForUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;  // Assuming you have logged-in user data

    const messages = await Message.find({
        $or: [{ senderId: userId }, { recipientId: userId }]
    })
        .populate("senderId", "name")  // Populate sender's name
        .populate("recipientId", "name");  // Populate recipient's name

    res.status(200).json({
        success: true,
        messages
    });
});
// ----------get specific message-----------
// Function to get a specific message by ID
export const getMessageById = catchAsyncErrors(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId)
        .populate("senderId", "name")  // Populate sender's name
        .populate("recipientId", "name");  // Populate recipient's name

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    res.status(200).json({
        success: true,
        message
    });
});

// Function to reply to a message
export const replyToMessage = catchAsyncErrors(async (req, res, next) => {
    const { messageId, replyMessage } = req.body;

    // Find the original message
    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
        return next(new ErrorHandler("Original message not found", 404));
    }

    // Check if the current user is either the sender or the recipient of the original message
    if (originalMessage.senderId.toString() !== req.user.id && originalMessage.recipientId.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not allowed to reply to this message", 403));
    }

    // Create a reply
    const reply = new Message({
        senderId: req.user.id,
        recipientId: originalMessage.senderId === req.user.id ? originalMessage.recipientId : originalMessage.senderId, // Reply goes to the opposite party
        classId: originalMessage.classId,
        message: replyMessage,
        isAnonymous: false  // You can modify this based on requirements
    });

    await reply.save();

    res.status(200).json({
        success: true,
        message: "Reply sent successfully"
    });
});


// -----------------delete specific message---------
// Function to delete a message
// export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
//     const { messageId } = req.params;

//     // Find the message
//     const message = await Message.findById(messageId);

//     if (!message) {
//         return next(new ErrorHandler("Message not found", 404));
//     }

//     // Check if the current user is the sender
//     if (message.senderId.toString() !== req.user.id) {
//         return next(new ErrorHandler("You are not authorized to delete this message", 403));
//     }

//     // Delete the message
//     await message.remove();

//     res.status(200).json({
//         success: true,
//         message: "Message deleted successfully"
//     });
// });

//------------------- Function to mark a message as read
// export const markMessageAsRead = catchAsyncErrors(async (req, res, next) => {
//     const { messageId } = req.params;

//     // Find the message
//     const message = await Message.findById(messageId);

//     if (!message) {
//         return next(new ErrorHandler("Message not found", 404));
//     }

//     // Check if the current user is the recipient
//     if (message.recipientId.toString() !== req.user.id) {
//         return next(new ErrorHandler("You are not authorized to mark this message as read", 403));
//     }

//     // Update the message as read (you can add a 'read' field if you wish)
//     message.read = true;  // Assuming you add a 'read' field to the schema

//     await message.save();

//     res.status(200).json({
//         success: true,
//         message: "Message marked as read"
//     });
// });
// -----------------send message-------