const errormiddleware=(err,req,res,next)=>{
    err.statusCode=err.statusCode|| 500;
    err.message=err.message||"something went wrong"
   return res.status(err.statusCode).json({
        Success:false,
        message:err.message,
        stack:err.stack
    })
}
export default errormiddleware;