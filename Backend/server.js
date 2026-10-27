import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
import router from "./Router/Userrouter.js";
import cors from "cors"
import cookieParser from "cookie-parser";

dotenv.config({path:"./config/config.env"})
const app = express()
const port = process.env.PORT || 30000
mongoose.connect("mongodb://RPSPhotoStudio:pandi_selvan_7708147489@ac-v5vsqlb-shard-00-00.i8vngwc.mongodb.net:27017,ac-v5vsqlb-shard-00-01.i8vngwc.mongodb.net:27017,ac-v5vsqlb-shard-00-02.i8vngwc.mongodb.net:27017/RPSPhotoStudio?ssl=true&replicaSet=atlas-1nrc93-shard-0&authSource=admin")
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json())
  app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
  app.use(cookieParser())
  app.use(router)
  app.listen(port,()=>{
  console.log(`port Run in : ${port}`)
})