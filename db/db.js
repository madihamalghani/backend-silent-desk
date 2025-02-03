import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({path:'./config/config.env'})

const url = process.env.DB_CONNECT || 'mongodb://localhost:27017'; 

const dbName='Silent_Desk';

async function connectToDb() {
    try {
        await mongoose.connect(url, {
            dbName
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
}


export default connectToDb;