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
export const login=catchAsyncErrors(async(req,res,next)=>{
    const {email,password} =req.body;
    if(!email || !password){
        return next(new ErrorHandler('Be good and fill full Login form',400))
    }
    const user=await User.findOne({email}).select("+password")//get password
    if(!user){
        return next(new ErrorHandler('Invalid email or password',400))
    }
    sendToken(user,201,res,'User logged in successfully!')

})

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

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

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
