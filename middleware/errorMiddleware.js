const errorHandler=(error,req,res,next)=>{
    const statusCode=res.statusCode?res.statusCode:500
    res.statusCode=statusCode
    res.json({message:error.message,
    stack:error.stack})
}
module.exports=errorHandler;