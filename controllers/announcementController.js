import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Announcement } from "../models/announcementSchema.js"; // Adjust path as needed
import { Class } from '../models/classSchema.js';
let io;
export const setSocketIo = (socketIo) => {
    io = socketIo;
};

// Create a new announcement
export const createAnnouncement = catchAsyncErrors(async (req, res, next) => {
    const { content } = req.body;
    const adminId = req.user.id;

    const {classId}=req.params;
    // it needs a lot of logic
    if(!content){
        return next(new ErrorHandler("Please provide content of the announcement", 404));

    }
    if(!classId){
        return next(new ErrorHandler("Please provide classId of the announcement", 404));

    }
    const classGroup = await Class.findById(classId);

    if (!classGroup.admins.includes(adminId)) {
        return next(new ErrorHandler("You can not announce anything, Be an admin first", 403));
    }
    const announcement = new Announcement({ classId, adminId, content });
    await announcement.save();
    
    if (io) {
        io.to(classId.toString()).emit("newAnnouncement", announcement);
    }
    
    res.status(201).json({
        success: true,
        announcement
    });
});

// Get all announcements for a specific class
export const getAnnouncementsByClass = catchAsyncErrors(async (req, res, next) => {
    const { classId } = req.params;
    
    const announcements = await Announcement.find({ classId }).sort({ timestamp: -1 });
    
    res.status(200).json({
        success: true,
        announcements
    });
});

// Get a single announcement by ID
export const getAnnouncementById = catchAsyncErrors(async (req, res, next) => {
    const { announcementId } = req.params;
    
    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
        return next(new ErrorHandler("Announcement not found", 404));
    }
    
    res.status(200).json({
        success: true,
        announcement
    });
});

// Update an announcement
export const updateAnnouncement = catchAsyncErrors(async (req, res, next) => {
    const { announcementId } = req.params;
    const { content } = req.body;
    
    let announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
        return next(new ErrorHandler("Announcement not found", 404));
    }

    // Check if the logged-in user is the creator (admin) of the announcement
    if (announcement.adminId.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to edit this announcement", 403));
    }

    // Update content
    announcement.content = content;
    announcement.timestamp = Date.now();
    await announcement.save();

    // Emit WebSocket event if io exists
    if (global.io) {
        global.io.to(announcement.classId.toString()).emit("updateAnnouncement", announcement);
    }

    res.status(200).json({
        success: true,
        message: "Announcement updated successfully",
        announcement
    });
});

// Delete an announcement
export const deleteAnnouncement = catchAsyncErrors(async (req, res, next) => {
    const { announcementId } = req.params;
    
    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
        return next(new ErrorHandler("Announcement not found", 404));
    }

    // Check if the logged-in user is the creator (admin) of the announcement
    if (announcement.adminId.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorHandler("You are not authorized to delete this announcement", 403));
    }
    
    // Delete announcement
    await announcement.deleteOne();

    // Notify clients via WebSocket
    if (global.io) {
        global.io.to(announcement.classId.toString()).emit("deleteAnnouncement", announcementId);
    }

    res.status(200).json({
        success: true,
        message: "Announcement deleted successfully"
    });
});
