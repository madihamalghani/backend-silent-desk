import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Message } from "../models/messageSchema.js";

import { clients } from '../websocket.js'; // Import WebSocket clients

// Function to create a message and send via WebSocket
export const createMessage = catchAsyncErrors(async (req, res, next) => {
    const { recipientId, classId, message, isAnonymous } = req.body;

    if (!recipientId || !classId || !message) {
        return next(new ErrorHandler("Recipient ID, Class ID, and Message are required", 400));
    }

    const newMessage = new Message({
        senderId: req.user.id,
        recipientId,
        classId,
        message,
        isAnonymous
    });

    await newMessage.save();

    // Real-time WebSocket broadcast to recipient
    const recipientSocket = clients.get(recipientId);
    if (recipientSocket && recipientSocket.readyState === 1) { // 1 = WebSocket.OPEN
        recipientSocket.send(JSON.stringify({
            type: "newMessage",
            sender: isAnonymous ? "Anonymous" : req.user.id,
            message,
            classId
        }));
    }

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
        .populate("senderId", "name")
        .populate("recipientId", "name");

    // Mark all fetched messages as read
    await Message.updateMany(
        { recipientId: userId, read: false },
        { $set: { read: true } }
    );

    res.status(200).json({
        success: true,
        messages
    });
});
// -----------------get unread messages from user--------------

export const getUnreadMessagesForUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    const unreadMessages = await Message.find({
        recipientId: userId,
        read: false
    })
        .populate("senderId", "name")
        .populate("recipientId", "name");

    res.status(200).json({
        success: true,
        unreadMessages
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
    const originalMessage = await Message.findById(messageId).populate('senderId recipientId');

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
        recipientId: originalMessage.senderId === req.user.id ? originalMessage.recipientId : originalMessage.senderId, // Ensure recipientId is correctly assigned
        classId: originalMessage.classId,
        message: replyMessage,
        isAnonymous: false  // Modify as needed
    });


    await reply.save();

    // Check for valid recipientId before emitting WebSocket
    if (!reply.recipientId) {
        return next(new ErrorHandler("Recipient ID is missing for the reply", 400));
    }

    // Emit WebSocket event for the reply
    const io = req.app.get('socketio');
    io.to(reply.recipientId.toString()).emit('newReply', {
        message: reply,
        senderId: req.user.id
    });

    res.status(200).json({
        success: true,
        message: "Reply sent successfully"
    });
});

// ---------------------------------

// Function to delete a message
export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
    const { messageId } = req.params;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    // Check if the current user is the sender
    if (message.senderId.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to delete this message", 403));
    }

    // Delete the message using deleteOne (instead of remove)
    await Message.deleteOne({ _id: messageId }); // Or message.delete()

    res.status(200).json({
        success: true,
        message: "Message deleted successfully"
    });
});
// ------------------edit message------------------

export const editMessage = catchAsyncErrors(async (req, res, next) => {
    const {  newMessage } = req.body;
    const {messageId} =req.params;

    // Find the original message
    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Original message not found", 404));
    }

    // Check if the current user is the sender
    if (message.senderId.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to edit this message", 403));
    }

    // Update the message
    message.message = newMessage;
    await message.save();

    res.status(200).json({
        success: true,
        message: "Message updated successfully"
    });
});



//------------------- Function to mark a message as read should be done in frontend
