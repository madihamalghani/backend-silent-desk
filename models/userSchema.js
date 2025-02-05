// this is a global user schema
//  for signup or login
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: [3,'Username must be 3 characters long'],
            maxlength: [20,'Username must not exceed 20 characters']
        },
        email: {
            type: String,
            required: true,
            unique: true, 
            trim: true,
            lowercase: true,
            validate:[validator.isEmail,'Please provide a valid email'],

        },
        password:{
            type: String,
            required:true,
            minlength:[6,'Password length must be 6 characters'],
            maxlength:[20,'password must not exceed 20 characters'],
            select:false
        },
        joinedAt:{
            type:Date,
            default:Date.now,
        }

    }
)
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}
// jwt token generate:
userSchema.methods.getJwtToken=function(){
return jwt.sign({id:this.id},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRE})
}

export const User=mongoose.model('User', userSchema)
// module.exports =mongoose.model('User', 'userSchema');