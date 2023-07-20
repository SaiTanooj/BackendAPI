const express=require('express')
const router=express.Router()
const{protect,adminOnly}=require("../middleware/authMidlleware")
const {check,validationResult}=require("express-validator")
const {getuser, forgetPassword, signIn,deleteUser,getUser} =require("../controller/userController")
const {verifyResetPassword}=require("../controller/verifyResetPassword")
const {verifyEmail,resendEmailVerificationToken}=require("../controller/userController")
const{createUser}=require("../controller/userController")
const validate=(req,res,next)=>{
    const error=validationResult(req).array();
    if(error.length){
       return  res.json({error:error[0].msg})
    }
    next()
}
router.get("/",getuser)
router.post("/create",[check('name').trim().not().isEmpty().withMessage("Name is missing"),
check('email').normalizeEmail().isEmail().withMessage("email is invalid"),
check('password').trim().not().isEmpty().withMessage("Password is missing").isLength({min:8,max:20}).withMessage("Password must be 8 characters long")],validate,createUser)
router.post('/verifyemail',verifyEmail)
router.post("/resendotp",resendEmailVerificationToken)
router.post("/resetpassword",forgetPassword)
router.post("/verifypasswordreset",verifyResetPassword,(req,res)=>{
    return res.json({success:"valid"})
})
router.post("/signin",[check('email').normalizeEmail().isEmail().withMessage("email is invalid"),
check('password').trim().not().isEmpty().withMessage("Password is missing").isLength({min:8,max:20}).withMessage("Password must be 8 characters long")],validate,signIn)
router.delete("/:id",protect,adminOnly,deleteUser)
router.get("/getusers",protect,adminOnly,getUser)
router.get("/getusers",protect,adminOnly,getUser)

module.exports=router