import express from 'express'
import cors from 'cors'
import { connectDB } from './src/db/databaseConnection.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

connectDB()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT
app.listen(port, ()=>{
    console.log("App is listening to the port " + port)
})

import userRouter from './src/routes/user.route.js'

app.use("/api/v1/users", userRouter)