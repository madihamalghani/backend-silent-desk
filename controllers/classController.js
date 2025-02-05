import crypto from 'crypto';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Class } from "../models/classSchema.js";

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


// ---------------------Find class by code---------------
export const findClassByCode = catchAsyncErrors(async (req, res, next) => {
    const { classCode } = req.body;
    if (!classCode) {
        return next(new ErrorHandler('Please Provide Class Code'))
    }
    const classExists = await Class.findOne({ classCode });
    if (!classExists) {
        return next(new ErrorHandler('Please Provide Correct Class Code'))

    }
    res.status(200).json({

        success: true,
        message: "Class Exists",
        class: classExists // Send the full class data from DB
    })

})
// ------------------Join class with approval----------------------------
// export const joinClass = catchAsyncErrors(async (req, res, next) => {
//     const { classCode, classDisplayName } = req.body;
//     const userId = req.user._id; 

//     // Find class by classCode
//     const foundClass = await Class.findOne({ classCode });
//     if (!foundClass) return res.status(404).json({ success: false, message: "Class not found" });

//     // Check if user already requested
//     const existingMembership = await Membership.findOne({ userId, classId: foundClass._id });
//     if (existingMembership) return res.status(400).json({ success: false, message: "Request already sent" });

//     // Create join request with "pending" status
//     await Membership.create({
//         userId,
//         classId: foundClass._id,
//         classDisplayName,
//         role: "user",
//         status: "pending"
//     });

//     res.status(200).json({
//         success: true,
//         message: "Join request sent to admin!"
//     });
// });
// ------------------------------------