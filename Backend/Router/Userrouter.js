import { Router } from "express";
import { deleteUser, getUserById, getUsers, loginUser, registerUser, updateUser } from "../Controller/Usercontrol.js";
import { verifytoken } from "../Helper/userauth.js";
import { authorizeRoles } from "../middleware/role.js";


const router = Router();

router.route("/login").post(loginUser)
router.route("/register").post(registerUser)

router.route("/users").get(verifytoken,authorizeRoles("user"),getUsers)
router.route("/user/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default router;
