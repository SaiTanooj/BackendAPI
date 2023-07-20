const express=require('express')
const app=express();
const PORT=3000
const cors=require('cors')
const router=require("./routes/userRoutes")
const connectDB=require("./config/db")
const morgan=require('morgan')
const errorHandler=require("../server/middleware/errorMiddleware")
//Middleware

connectDB()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
app.use("/api",router)
app.use("/*",(req,res)=>{
    res.status(404).json({message:"page not found"})
})
app.use(errorHandler)
app.listen(PORT,()=>{
    console.log("server set up successfully");
})