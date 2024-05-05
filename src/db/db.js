import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
import dotenv from "dotenv"

async function getURL() {
  await dotenv.config();
  return process.env.MONGODB_URL;
}

const connectDB = async () => {
    try {
        const uri = await getURL();
        const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`)
        console.log(`\nMongoDB connected !!`)
    } catch (error) {
        console.error("ERROR : ", error)
    }
}

export default connectDB