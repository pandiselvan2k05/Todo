
import jwt from "jsonwebtoken";
import User from "../Module/UserModule.js";

export const verifytoken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token missing"
      });
    }

    const token = authHeader.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.PASSWORD
    );

    if (decoded.tokenType !== "access") {
      return res.status(401).json({
        message: "Invalid access token"
      });
    }

    const user = await User.findById(decoded.id).select(
      "-password -refreshTokenHash"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired"
      });
    }

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};
