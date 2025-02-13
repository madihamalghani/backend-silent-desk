import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { User } from '../models/userSchema.js';
import { sendToken } from '../utils/jwToken.js';
export const register=catchAsyncErrors(async(req,res,next)=>{
    const {username,email,password} = req.body;
    if(!username || !email || !password){
        return next(new ErrorHandler('Please fill full registration form'))
        }
    const isEmail=await User.findOne({email});
    if(isEmail){
        return next(new ErrorHandler('Email already exists'))
        }
        const user=await User.create({
            username,
            email,
            password,
        });
        sendToken(user,201,res,'User registered successfully');

})

// ------------Login User---------------------
export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
        return next(new ErrorHandler('Be good and fill full Login form', 400));
    }

    // Find user and SELECT password (since it's hidden by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 400));
    }

    // ✅ Compare hashed password with entered password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new ErrorHandler('Invalid email or password', 400));
    }

    // If password matches, send token
    sendToken(user, 201, res, 'User logged in successfully!');
});

// ---------------Logout User--------------------------
export const logout=catchAsyncErrors(async(req,res,next)=>{
    res.status(200)
    .cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
        path: '/'
    })
    .json({
        success: true,
        message: 'User logged out successfully!'
    });
})
// ---------------get users---------------------
export const getusers=catchAsyncErrors(async(req,res,next)=>{
    const user=req.user;
    res.status(200).json({
        success:true,
        user,
    })
})
// ----------------Delete account--------------
export const deleteAccount = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Find classes where the user is an admin
    const adminClasses = await Class.find({ admins: userId });

    // Check if the user is the only admin in any class
    for (let cls of adminClasses) {
        if (cls.admins.length === 1) {
            return next(new ErrorHandler("You cannot delete your account because you are the only admin in a class. Please assign another admin before deleting.", 403));
        }
    }

    // If user is not the only admin, proceed with deletion
    await user.deleteOne(); 

    res.status(200)
        .cookie("token", null, {
            httpOnly: true,
            expires: new Date(Date.now()),
            path: '/'
        })
        .json({
            success: true,
            message: "Account deleted successfully!"
        });
});
// ----------------get user----------------
