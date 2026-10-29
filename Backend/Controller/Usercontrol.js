import User from "../Module/UserModule.js";


import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs";


export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenType: "access"
    },
    process.env.PASSWORD,
    { expiresIn: "1m" }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      tokenType: "refresh"
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Store a hash of the refresh token in MongoDB
    user.refreshTokenHash = await bcryptjs.hash(
      refreshToken,
      10
    );
    await user.save();

    // Refresh token only in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Access token returned to React
    res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REFRESH ACCESS TOKEN
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Refresh token missing. Please login."
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_SECRET
    );

    if (decoded.tokenType !== "refresh") {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        message: "Session expired. Please login."
      });
    }

    const isValid = await bcryptjs.compare(
      token,
      user.refreshTokenHash
    );

    if (!isValid) {
      return res.status(401).json({
        message: "Refresh token is invalid"
      });
    }

    // Create a new access token
    const newAccessToken = createAccessToken(user);

    // Rotate refresh token too
    const newRefreshToken = createRefreshToken(user);

    user.refreshTokenHash = await bcryptjs.hash(
      newRefreshToken,
      10
    );
    await user.save();

    res.cookie(
      "refreshToken",
      newRefreshToken,
      cookieOptions
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(401).json({
      message: "Refresh token expired or invalid. Please login again."
    });
  }
};

// LOGOUT
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (user?.refreshTokenHash) {
          const isValid = await bcryptjs.compare(
            token,
            user.refreshTokenHash
          );

          if (isValid) {
            user.refreshTokenHash = null;
            await user.save();
          }
        }
      } catch {
        // Clear cookie even if the token has expired
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
