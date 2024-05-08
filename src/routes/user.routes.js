import { Router } from "express";
import { registerUser } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/signup").post(
    upload.fields([
        {
            name : "healthInfo",
            maxCount: 1
        }
    ]),
    registerUser
)

export default router