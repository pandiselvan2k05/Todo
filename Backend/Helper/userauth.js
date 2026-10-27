import jwt from "jsonwebtoken"
import User from "../Module/UserModule.js"
export const verifytoken = async(req,res,next)=>{
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