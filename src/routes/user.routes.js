import { Router } from "express";
import { changeCurrentPassworrd, logOutUser, loginUser, medicineDetails, refreshAccessToken, registerUser, getdoctorDetails, getCurrentUser, messageApi } from "../controllers/users.controllers.js";
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
router.route("/refreshToken").post(refreshAccessToken)
router.route("/changePassword").post(changeCurrentPassworrd)
router.route("/medDetails").post(medicineDetails)
router.route("/updateDetails").post()
router.route("/SendSms").post(messageApi)

//get routes
router.route("/getDoctorDetails").get(getdoctorDetails)
router.route("/getMedicineDetails").get()

export default router