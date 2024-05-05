import dotenv from "dotenv";
import { app } from "./app.js";
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";
import connectDB from "./db/db.js";

dotenv.config();

connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Mongodb connection failed !! ", err);
})