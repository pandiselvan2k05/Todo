import  { Schema,model } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcryptjs.hash(this.password, 10);
});

userSchema.methods.createJwt = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role
    },
    process.env.PASSWORD,
    { expiresIn: "3d" }
  );
};

userSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

const User = model("todouser", userSchema);
export default User;
