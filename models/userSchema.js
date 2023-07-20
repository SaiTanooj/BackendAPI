const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

const userSchema=mongoose.Schema({
   name: {
            type:String,
           
            
        },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true,
        unique:true
    },
    isVerified:{
        type:Boolean,
        required:true,
        default:false

    },
    role: {
        type: String,
        required: true,
        default: "subscriber",
      
      }

})
userSchema.pre('save',async function(next){//hooks provided in mongodb execute when the document is saved
    if(this.isModified("password")){//if my password is modifies 
     this.password= await bcrypt.hash(this.password,10)//10 round of salting 

    }
    next();
})
module.exports=mongoose.model("User",userSchema)