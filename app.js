import cookieParser from 'cookie-parser';
import cors from 'cors'; //connection
import { config } from "dotenv";
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.js';

import express from 'express';
import connectToDb from './db/db.js';
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
    // app.use('/api/user',userRouter)
    // app.use('/api/application',applicationRouter)
    // app.use('/api/job',jobRouter)

// cookie-parser is written before express.json

//multer can also be used
connectToDb();

// notFoundMiddleware must be after all routes
app.use(notFoundMiddleware);

// middleware always on end else face error:
app.use(errorMiddleware)
export default app;