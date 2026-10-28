import jwt from "jsonwebtoken"
import User from "../Module/UserModule.js"
export const verifytoken = async(req,res,next)=>{
  try{

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const {token} = req.cookies
    console.log(token)
    if(!token){
      res.status(401).json({
        message:"Access denined please login"
      })
    }
    const decode = jwt.verify(token,process.env.PASSWORD)
    req.user = await User.findById(decode.id)
    next()
  }
  catch(error){
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}