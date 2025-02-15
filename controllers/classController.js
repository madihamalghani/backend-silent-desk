import crypto from 'crypto';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Membership } from '../models/classMembershipSchema.js';
import { Class } from "../models/classSchema.js";
// import { Membership } from '../models/messageSchema.js';
// --------------Create Class--------------------
export const createClass = catchAsyncErrors(async (req, res, next) => {
    const { name, description, category } = req.body;
    if(!name || !description || !category){
        return next(new ErrorHandler('Please Provide Complete detail'))
    }
    const userId = req.user.id;
    let classCode;
    let isUnique = false;
    while (!isUnique) {
        classCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        const existingClass = await Class.findOne({ classCode });
        if (!existingClass) {
            isUnique = true;
        }
    }
    const newClass = await Class.create({
        name,
        description,
        category,
        classCode,
        admins: [userId]
    });
    // Add creator as a member
    await Membership.create({
        userId,
        classId: newClass._id,
        classDisplayName: req.user.username, // Unique within class
        role: "admin",
    });


    res.status(201).json({
        success: true,
        message: "Class created successfully",
        class: newClass
    });
});
// ----------------------Update Class---------------
export const updateClass = catchAsyncErrors(async (req, res, next) => {
    const { classId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;
if(!name || !description){
    return next(new ErrorHandler("Please provide content to update this class", 403));

}
    // Find the class
    const classToUpdate = await Class.findById(classId);
    if (!classToUpdate) {
        return next(new ErrorHandler("Class not found", 404));
    }

    // Check if the user is an admin of this class
    if (!classToUpdate.admins.includes(userId)) {
        return next(new ErrorHandler("You are not authorized to edit this class", 403));
    }

    // Update class details
    if (name) classToUpdate.name = name;
    if (description) classToUpdate.description = description;

    await classToUpdate.save();

    res.status(200).json({
        success: true,
        message: "Class updated successfully",
        class: classToUpdate
    });
});

export const getClassDetails=catchAsyncErrors(async (req,res,next)=>{
    const { classId } = req.params;
    
    // Find the class by its ID
    const classDetails = await Class.findById(classId);
    
    if (!classDetails) {
        return next(new ErrorHandler('Class Not Found', 404));
    }
    
    // Respond with the class details
    res.status(200).json({
        success: true,
        class: classDetails,
    });

})

export const findClassByCode = catchAsyncErrors(async (req, res, next) => {
    const { classCode } = req.query;

    if (!classCode) {
        return next(new ErrorHandler('Please Provide a Class Code', 400));
    }

    const classExists = await Class.findOne({ classCode });

    if (!classExists) {
        return next(new ErrorHandler('Class Not Found. Please check the code and try again.', 404));
    }

    // Respond with class details
    res.status(200).json({
        success: true,
        message: "Class Exists",
        class: classExists // Send full class data
    });
});


// get--all-classes on my web
export const getAllClasses = catchAsyncErrors(async (req, res, next) => {
    const classes = await Class.find(); // Fetch all classes

    res.status(200).json({
        success: true,
        classes,
    });
});
// -----------where user is member----------
export const getUserClasses = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    const classes = await Class.find({ members: userId }); // Fetch classes where the user is a member

    res.status(200).json({
        success: true,
        classes,
    });
});
// -----------where user is admin---------
export const getAdminClasses = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    const classes = await Class.find({ admins: userId }); // Fetch classes where the user is an admin

    res.status(200).json({
        success: true,
        classes,
    });
});
