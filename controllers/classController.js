import crypto from 'crypto';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Class } from "../models/classSchema.js";
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
