const { isValidObjectId } = require("mongoose")
const passwordResetToken=require("../models/passwordResetToken")
exports.verifyResetPassword=async (req,res,next)=>{
    const{token,userId}=req.body()
    if(!token||!isValidObjectId(userId)){
        return res.json({error:"Invalid user request"})
    }
    const resetToken=passwordResetToken.findOne({owner:userId})
    if(!resetToken){
        return res.json({error:"Your token already exists"})
    }
    const matched=await resetToken.compareToken(token)
    if(!matched){
        res.json({error:"invalid request"})
    }
    req.resetToken=resetToken
    next()
}