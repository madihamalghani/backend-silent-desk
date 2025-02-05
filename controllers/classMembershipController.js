import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Membership } from "../models/classMembershipSchema.js";
import { Class } from "../models/classSchema.js";
import { formatDate } from "../utils/dateUtils.js";

// ----------------  Request to Join a Class ----------------
export const requestToJoinClass = catchAsyncErrors(async (req, res, next) => {
    const { classCode, classDisplayName } = req.body;

    if (!classDisplayName) {
        return next(new ErrorHandler('Please provide your class display name'));
    }
    if (!classCode) {
        return next(new ErrorHandler('Please provide your class code'));
    }
    const userId = req.user.id;
    const classExists = await Class.findOne({ classCode });
    if (!classExists) {
        return next(new ErrorHandler("Invalid class code. Class not found", 404));
    }
    const classId = classExists._id;
    const existingMembership = await Membership.findOne({ classId, userId });
    if (existingMembership) {
        return next(new ErrorHandler("You are already in this class", 400));
    }
    const newMembership = await Membership.create({
        userId,
        classId,
        classDisplayName,
        role: "user",
        status: "pending",
        joinedAt: Date.now() // Ensure this field is being set when the user joins

    });

    res.status(201).json({
        success: true,
        message: "Request sent to join the class",
        membership: newMembership
    });
});

// -------------------getPendingRequests------------------------------

export const getPendingRequests = catchAsyncErrors(async (req, res, next) => {
    const { classId } = req.params;
    const adminId = req.user.id;

    if (!classId) {
        return next(new ErrorHandler("Class ID is required", 400));  // If classId is missing, return error
    }

    const classGroup = await Class.findById(classId);

    if (!classGroup) {
        return next(new ErrorHandler("Class not found", 404));  // If no class found with the given ID
    }


    if (!classGroup.admins.includes(adminId)) {
        return next(new ErrorHandler("You are not authorized to view requests", 403));
    }

    const pendingRequests = await Membership.find({ classId, status: "pending" }).populate("userId", "classDisplayName joinedAt");
    // formated date
    const formattedRequests = pendingRequests.map(request => {
        let formattedJoinDate = "Invalid date"; // Default value in case of invalid date
        try {
            console.log("joinedAt value:", request.userId.joinedAt); // Log the actual joinedAt
            formattedJoinDate = formatDate(request.userId.joinedAt); // Format the joinedAt date here
        } catch (error) {
            console.error("Error formatting date: ", error.message);
        }
        return {
            ...request.toObject(),
            formattedJoinDate
        };
    });
    res.status(200).json({
        success: true,
        pendingRequests:formattedRequests,
    });
});

// ---------------- Approve or Reject Join Request ----------------

export const managePendingRequest = catchAsyncErrors(async (req, res, next) => {
    const { classId, userId, status } = req.body;
    const adminId = req.user.id;


    if (!classId || !userId || !status) {
        return next(new ErrorHandler("Class ID, User ID, and Status are required", 400));
    }

    const classGroup = await Class.findById(classId);
    if (!classGroup) {
        return next(new ErrorHandler("Class not found", 404));
    }

    if (!classGroup.admins.includes(adminId)) {
        return next(new ErrorHandler("You are not authorized to manage requests", 403));
    }

    const membershipRequest = await Membership.findOne({ classId, userId, status: "pending" });
    if (!membershipRequest) {
        return next(new ErrorHandler("Pending request not found", 404));
    }
    if (status === "approve") {
        membershipRequest.status = "approved";
        membershipRequest.joinedAt = new Date(); // Set current date as joining date

    } else if (status === "reject") {
        membershipRequest.status = "rejected";
    } else {
        return next(new ErrorHandler("Invalid status", 400));
    }

    await membershipRequest.save();

    res.status(200).json({
        success: true,
        message: `Membership request ${status === "approve" ? "approved" : "rejected"} successfully!`,
        joinedDate: status === "approve" ? formatDate(new Date(), "dd MMM yyyy") : null // Send formatted joined date

    });
});

// ---------------- List All Members in a Class with approved status ----------------
export const listClassMembers = catchAsyncErrors(async (req, res, next) => {
    const { classId } = req.params;

    const members = await Membership.find({ classId, status: "approved" }).populate("userId", "name email");

    res.status(200).json({
        success: true,
        members
    });
});

// ------------------------promoteToAmdmin------------------
export const promoteToAdmin = catchAsyncErrors(async (req, res, next) => {
    const { classId } = req.params;

    const { userId } = req.body;

    const adminId = req.user.id;
    if (!userId) {
        return next(new ErrorHandler("Provide User id", 404));

    }
    const classGroup = await Class.findById(classId);
    if (!classGroup) {
        return next(new ErrorHandler("Class not found", 404));
    }
    if (!classGroup.admins.includes(adminId)) {
        return next(new ErrorHandler("Only an admin can promote members", 403));
    }
    const updatedMembership = await Membership.findOneAndUpdate(
        { classId, userId },
        { role: "admin" },
        { new: true }
    );
    if (!updatedMembership) {
        return next(new ErrorHandler("User not found in class", 404));
    }
    if (!classGroup.admins.includes(userId)) {
        classGroup.admins.push(userId);
        await classGroup.save();
    }
    res.status(200).json({
        success: true,
        message: "User promoted to admin",
        membership: updatedMembership
    });
});


// ------------------demoteAdmin------------------
export const demoteAdmin = catchAsyncErrors(async (req, res, next) => {
    const {  userId } = req.body;
    const adminId = req.user.id;
    const {classId}=req.params;

    if ( !userId) {
        return next(new ErrorHandler("User ID are required", 400));
    }

    const classGroup = await Class.findById(classId);
    if (!classGroup) {
        return next(new ErrorHandler("Class not found", 404));
    }

    if (!classGroup.admins.includes(adminId)) {
        return next(new ErrorHandler("You are not authorized to perform this action", 403));
    }
    if (!classGroup.admins.includes(userId)) {
        return next(new ErrorHandler("User is not an admin!", 400));
    }
    if (classGroup.admins.length === 1) {
        return next(new ErrorHandler("Cannot demote the last admin!", 400));
    }

    // Remove user from admins list
    classGroup.admins = classGroup.admins.filter(id => id.toString() !== userId);

    if (!classGroup.members.includes(userId)) {
        classGroup.members.push(userId);
    }

    await classGroup.save();

    res.status(200).json({
        success: true,
        message: "Admin demoted to member successfully!",
    });
});



// ------------------------Remove User--------------------------------
export const removeMember = catchAsyncErrors(async (req, res, next) => {
    const { userId ,classId} = req.body;
    const adminId = req.user.id;

    const classGroup = await Class.findById(classId);
    if (!classGroup) {
        return next(new ErrorHandler("Class not found", 404));
    }

    if (!classGroup.admins.includes(adminId)) {
        return next(new ErrorHandler("Only an admin can remove members", 403));
    }

    // Remove membership entry
    await Membership.findOneAndDelete({ classId, userId });

    res.status(200).json({
        success: true,
        message: "User removed from class"
    });
});
// ---------------- Leave a Class ----------------
export const leaveClass = catchAsyncErrors(async (req, res, next) => {
    const { classId } = req.params;
    const userId = req.user.id;
    const classGroup = await Class.findById(classId);
    if (!classGroup) {
        return next(new ErrorHandler("Class not found", 404));
    }
    if (classGroup.admins.includes(userId)) {
        return next(new ErrorHandler("Admins cannot leave the class", 403));
    }
    await Membership.findOneAndDelete({ classId, userId });
    res.status(200).json({
        success: true,
        message: "You have left the class"
    });
});
// ---------------------getAllUserClasses-----------------
export const getUserClasses = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    const adminClasses = await Class.find({ admins: userId });

    const memberships = await Membership.find({ userId, status: "approved" }).populate("classId");

    const memberClasses = memberships.map(membership => membership.classId);

    const allClasses = [...new Set([...adminClasses, ...memberClasses])];

    res.status(200).json({
        success: true,
        message:"Your Classes",
        classes: allClasses
    });
});

