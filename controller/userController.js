
exports.getuser=(req,res)=>{
    res.status(200).send("get succesfull")
}
const asynchandler=require('express-async-handler')
const jwt=require("jsonwebtoken")
const {generateRandomByte}=require("./resetPassword")
const {isValidObjectId}=require('mongoose')
const User=require("../models/userSchema")
const passwordResetToken=require("../models/passwordResetToken");
//const emailVerificationSchema=require("../models/emailVerificationToken");
const emailVerificationToken = require("../models/emailVerificationToken");
const nodemailer=require('nodemailer');

exports.createUser=async (req,res)=>{
    const{name,email,password}=req.body
    const newUser=new User({name,email,password});
    const olduser=await User.findOne({email})
    if(olduser){
        return res.status(401).json({error:"this mail is already used"})

    } 
    await newUser.save()
    let otp="";
    for(let i=0;i<=5;i++){
      const randomVal=Math.round(Math.random()*9)

      otp+=randomVal
    }
    const newEmailVerificationToken=new emailVerificationToken({owner:newUser._id,token:otp})
    await newEmailVerificationToken.save()
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "f7202ee65f0c7b",
          pass: "c67ebde3eebb4b"
        }
      });
      transport.sendMail({
        from:"Tanooj@gmail.com",
        to:newUser.email,
        subject:"Email Verification",
        html:`<p>Your Verification OTP is</p>
              <h1>${otp}</h1>`

        
      })
      
    res.status(201).json({
        user:{
          id:newUser._id,
          email:newUser.email,
          password:newUser.password
        }
    })
}
exports.verifyEmail=async(req,res)=>{
    const{userId,otp}=req.body
    if(!isValidObjectId(userId))return res.json({error:"Invalid User"})//check if our user is valid or not
    const user=await User.findById(userId)
    if(!user) return res.json({error:"Invalid User"})
    if(User.isVerified)return res.json({error:"user is already verified"})
    const token=await emailVerificationToken.findOne({owner:userId})
    if(!token){
       return  res.json({error:"token not found"})
    }
    const matched=await token.compareToken(otp)
    if(!matched){
        res.json({error:"OTP not matched"})
    }
    user.isVerified=true;
    await user.save();
    await emailVerificationToken.findByIdAndDelete(token._id)
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "f7202ee65f0c7b",
          pass: "c67ebde3eebb4b"
        }
      });
      transport.sendMail({
        from:"Tanooj@gmail.com",
        to:User.email,
        subject:"Welcome Email",
        html:`<p>You have been succesfully Verified</p>
              <h1>Welcome to the app</h1>`

        
      })
      
    res.json({message:"your email is verified"}
    )



}
exports.resendEmailVerificationToken=async(req,res)=>{
    const {userID}=req.body;
    const user=await User.findById(userID)
    if(!user){
       return  res.json({error:"User Not found"})
    }
    if(user.isVerified){
        return res.json("user already verified")
    }
    const alreadyHasToken=emailVerificationToken.findOne({
        owner:userID
    })
    if(alreadyHasToken){
        return res.json({error:"Token expired.Please Try after one Hour"})


    }
    let otp="";
    for(let i=0;i<5;i++){
      const randomVal=Math.round(Math.random()*9)

      otp+=randomVal
    }
    const newEmailVerificationToken=new emailVerificationToken({owner:newUser._id,token:otp})
    await newEmailVerificationToken.save()
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "f7202ee65f0c7b",
          pass: "c67ebde3eebb4b"
        }
      });
      transport.sendMail({
        from:"Tanooj@gmail.com",
        to:User.email,
        subject:"Email Verification",
        html:`<p>Your Verification OTP is</p>
              <h1>${otp}</h1>`

        
      })
      
    res.status(201).json({
        message:"Otp has been succesfully sent your account Please Verify"
    })



}
exports.forgetPassword=async(req,res)=>{
  const {email}=req.body;
  console.log(email)
  if(!email){
    return res.json({error:"No email Provided"})

  }
  const user=await User.findOne({email})
  if(!User){
    return res.json({error:"user Not found"})
  }
  const alreadyHasToken=await  passwordResetToken.findOne({owner:user._id})
  if(alreadyHasToken){
    res.json({error:"access currently blocked try after one hour"})
  }
  const token = await generateRandomByte();
  const newPasswordResetToken = await passwordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "f7202ee65f0c7b",
      pass: "c67ebde3eebb4b"
    }
  });

  transport.sendMail({
    from: "tanooj@reviewapp.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `
      <p>Click here to reset password</p>
      <a href='${resetPasswordUrl}'>Change Password</a>
    `,
  });

  res.json({ message: "Link sent to your email!" });
  

}
exports.signIn = async (req, res,) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Email/Password mismatch!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/Password mismatch!");

  const { _id, name } = user;

  const jwtToken = jwt.sign({ userId: _id }, 'fjaksdkflKFAFkfajdsfh');

  res.json({
    user: { id: _id, name, email, token: jwtToken, },
  });
};
exports.getUser=asynchandler(async(req,res)=>{
  const user=await User.findById(req.user._id)
  if(!user){
      res.status(400)
      throw new Error("User not found")
  }
  const {_id,name,email,password,phone,bio,photo,role,isVerified}=user
  res.status(200).json({
      _id,
      name,
      email,
      password,
      role,
      isVerified,
      token
  })
 
})
exports.deleteUser=asynchandler(async(req,res)=>{
  const user=User.findById(re.params.id)
  if(!user){
      res.status(400)
      throw new Error("User not found")
  }
  await user.remove()
  res.status(204).json({message:"User removed successfully"})
})
exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true })
}
exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "The new password must be different from the old one!"
    );

  user.password = newPassword;
  await user.save();

  await passwordResetToken.findByIdAndDelete(req.resetToken._id);

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "f7202ee65f0c7b",
      pass: "c67ebde3eebb4b"
    }
  });
  transport.sendMail({
    from:"Tanooj@gmail.com",
    to:newUser.email,
    subject:"Password has been reset succesfully ",
    html:`<p>Password reset Succesfull</p>`
          

    
  })

  res.json({
    message: "Password reset successfully, now you can use new password.",
  })}
