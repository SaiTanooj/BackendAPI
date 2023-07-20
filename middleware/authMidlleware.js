const asynchandler=require('express-async-handler')
const User=require("../models/userSchema")
const jwt=require("jsonwebtoken")
exports.protect = asynchandler(async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        res.status(401);
        throw new Error("Not authorized, please login");
      }
  
      // Verify token
      const verified = jwt.verify(token,"xyz123");
      // Get user id from token
      const user = await User.findById(verified.id).select("-password");
  
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }
      if (user.role === "suspended") {
        res.status(400);
        throw new Error("User suspended, please contact support");
      }
  
      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }
  });
exports.authorOnly=asynchandler(async(req,res,next)=>{
    if(req.user.role==="author" || req.user.role==="admin"){
        next()
    }else{
        res.status(404)
        throw new Error("Not authorised as an author")
    }
    })
    exports.verifiedOnly=asynchandler(async(req,res,next)=>{
        if(req.user  && req.user.isVerified==="true"){
            next()
        }else{
            res.status(404)
            throw new Error("Acct not verified")
        }
        })

        exports.adminOnly=asynchandler(async(req,res,next)=>{
            if(req.user && req.user.role==="admin"){
                next()
            }else{
                res.status(404)
                throw new Error("Not authorised as an author")
            }
            })