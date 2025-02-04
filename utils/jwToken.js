export const sendToken=(user,statusCode,res,message)=>{
    const token=user.getJwtToken();
    const options={// Sets the options for the cookie that stores the JWT
        expires:new Date(
            Date.now() + process.env.COOKIE_EXPIRE *24*60*60*1000//1000 mili sec
        ),
        httpOnly:true,
    };
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        user,
        message,
        token
    })
}