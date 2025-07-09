import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import geminiResponse from "./gemini.js";


dotenv.config()

const app = express()
app.use(cors({
    origin:"https://my-voice-ai-frontend.vercel.app",
    credentials:true
}))
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

// app.get("/",async(req,res)=>{
//     let prompt =  req.query.prompt
//     let data  = await geminiResponse(prompt)
//     res.json(data)
// })



app.listen(port,()=>{
    connectDB()
    console.log("Server is running on port 8000"); 
})


