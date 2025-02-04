import crypto from "crypto";
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Class } from "../models/classSchema.js";

export const createClass = catchAsyncErrors(async (req, res, next) => {
    const { className, description, category } = req.body;
    const userId = req.user.id; // Logged-in user is the admin

    const existingClass = await Class.findOne({ className });
    if (existingClass) {
        return next(new ErrorHandler("Class name already exists", 400));
    }

    const classCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const newClass = await Class.create({
        className,
        description,
        category,
        classCode,
        admins: [userId]
    });
    // Add creator as a member
    // await Membership.create({
    //     userId,
    //     classId: newClass._id,
    //     classDisplayName: req.user.username, // Unique within class
    //     role: "admin",
    // });

    // res.status(201).json({
    //     success: true,
    //     message: "Class created successfully!",
    //     class: newClass
    // });

    res.status(201).json({
        success: true,
        message: "Class created successfully",
        class: newClass
    });
});
// ---------------------Find class by code---------------
export const findClassByCode = catchAsyncErrors(async (req, res, next) => {
    const code = req.user.classCode;

    const classData = await Class.findOne(code);
    if (!classData) {
        return next(new ErrorHandler("Class not found ", 404));
    }
    res.status(200).json({
        success: true,
        classData
    })
})
// ------------------Send request to be a member----------------------------

// const addMemberToClass = async (classId, userId, displayName) => {
//     const classGroup = await Class.findById(classId);
//     if (!classGroup) throw new Error("Class not found");

//     // Check if the user is already in the class
//     const existingMember = classGroup.members.find(member => member.user.toString() === userId);
//     if (existingMember) throw new Error("User is already a member");

//     // Add new member with "pending" status
//     classGroup.members.push({
//         user: userId,
//         name: displayName,
//         status: "pending"
//     });

//     await classGroup.save();
//     console.log("Member added, waiting for approval.");
// };