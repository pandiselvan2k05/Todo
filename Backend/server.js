
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./Router/Userrouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({ path: "./config/config.env" });

const app = express();
const port = process.env.PORT || 30000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());

app.use(router);

mongoose.connect(process.env.URL)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(port, () => {
      console.log(`Port running on: ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });
