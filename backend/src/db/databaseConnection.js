import mongoose from "mongoose"
import dotenv from "dotenv"
import { apiError } from "../utils/apiError.js"
dotenv.config()


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("Database connected successfully")
        })
    } catch (error) {
        console.log("Error in database connection" + Error)
        throw new apiError(500,"Error in database connection")
    }
}

export {connectDB}