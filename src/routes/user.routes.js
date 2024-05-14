import { Router } from "express";
import { changeCurrentPassworrd, logOutUser, loginUser, medicineDetails, refreshAccessToken, registerUser, getdoctorDetails, getCurrentUser, messageApi, doctorDetails } from "../controllers/users.controllers.js";
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


//secured routes
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt, logOutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/changePassword").post(verifyJwt, changeCurrentPassworrd)
router.route("/medDetails").post(verifyJwt, medicineDetails)
router.route("/doctorDetails").post(verifyJwt, doctorDetails)
router.route("/updateDetails").post()

//get routes
router.route("/SendSms").get(verifyJwt, messageApi)
router.route("/getDoctorDetails").get(verifyJwt, getdoctorDetails)
router.route("/getMedicineDetails").get()
router.route("/getUser").get(verifyJwt, getCurrentUser)

export default router