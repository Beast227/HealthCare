import { Router } from "express";
import { logOutUser, loginUser, registerUser } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJwt, logOutUser)

export default router