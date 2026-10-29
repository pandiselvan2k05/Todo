
import express from "express";

import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUsers,
  getUserById,
  updateUser
} from "../Controller/Usercontrol.js";
import { verifytoken } from "../Helper/userauth.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Refresh token cookie-ai use pannum
router.post("/refresh", refreshToken);

// Logout
router.post("/logout", logoutUser);

// Protected CRUD routes
router.get("/users", verifytoken, getUsers);
router.get("/user/:id", verifytoken, getUserById);
router.put("/user/:id", verifytoken, updateUser);

export default router;
