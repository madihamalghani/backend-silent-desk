import cookieParser from 'cookie-parser';
import cors from 'cors'; //connection
import { config } from "dotenv";
import express from 'express';
import connectToDb from './db/db.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.js';
import classMembershipRouter from './routes/classMembershipRouter.js';
import classRouter from './routes/classRouter.js';
import messageRouter from './routes/messageRouter.js';
import userRouter from './routes/userRouter.js';
config({path:'./config/config.env'})
const app=express();
app.use(cors({
    origin:['http://localhost:4000',process.env.FRONTEND_URL],
    methods:['GET','POST','DELETE','PUT'],
    credentials:true
}
)); //for development only 
// app.get('/api/v1,user', (req, res) => {
//     res.send('Hello World!')
//     })
app.use(express.json());
app.use(cookieParser());
    app.use('/api/auth',userRouter)
    app.use('/api/class',classRouter)
    app.use('/api/membership',classMembershipRouter)
    app.use('/api/message',messageRouter)
    // app.use('/api/job',jobRouter)

// cookie-parser is written before express.json

//multer can also be used
connectToDb();

// notFoundMiddleware must be after all routes
app.use(notFoundMiddleware);

// middleware always on end else face error:
app.use(errorMiddleware)
export default app;