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
// -----------------------------------
export const getReceivedMessagesForUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id; // Get logged-in user ID

    const messages = await Message.find({ recipientId: userId }) // Only received messages
        .populate("senderId", "name") // Populate sender's name
        .sort({ createdAt: -1 }); // Sort by latest messages

    // Mark fetched messages as read
    await Message.updateMany(
        { recipientId: userId, read: false },
        { $set: { read: true } }
    );

    res.status(200).json({
        success: true,
        messages,
    });
});
// --------------------------------Send Messages-------------
export const getSentMessagesForUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id; // Logged-in user as sender

    // Find messages where the logged-in user is the sender
    const messages = await Message.find({ senderId: userId })
        .populate("recipientId", "name")  // Populate recipient's name
        .sort({ createdAt: -1 });         // Optional: sort by latest sent messages first

    res.status(200).json({
        success: true,
        messages,
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
    const { replyMessage, isAnonymous } = req.body;
    const { messageId } = req.params;

 
    
    // Validate the reply message
    if (!replyMessage || replyMessage.trim().length === 0) {
        return next(new ErrorHandler("Reply message cannot be empty", 400));
    }

    // Find the original message
    const originalMessage = await Message.findById(messageId).populate('senderId recipientId');

    if (!originalMessage) {
        console.log("Original message not found.");
        return next(new ErrorHandler("Original message not found", 404));
    }


    // Check if the current user is the recipient of the original message
    const isRecipient = originalMessage.recipientId._id.toString() === req.user.id.toString();
    
    // Ensure the current user is not the sender of the original message
    const isSender = originalMessage.senderId._id.toString() === req.user.id.toString();

  
    if (!isRecipient || isSender) {
        console.log("User is not authorized to reply to this message.");
        return next(new ErrorHandler("You are not allowed to reply to this message", 403));
    }

    // Create the reply message
    const reply = new Message({
        senderId: req.user.id,                // Current user (recipient) becomes the sender of the reply
        recipientId: originalMessage.senderId._id, // Reply goes back to the sender of the original message
        classId: originalMessage.classId,
        message: replyMessage,
        isAnonymous: isAnonymous || false      // Allow anonymous replies if specified
    });

    try {
        // Save the reply message to the database
        await reply.save();

        // Send a success response
        res.status(200).json({
            success: true,
            message: "Reply sent successfully"
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to send reply", 500));
    }
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
