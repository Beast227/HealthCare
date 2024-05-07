import { Router } from "express";
import { registerUser } from "../controllers/users.controllers.js";

const router = Router()

router.route("/signup").post(registerUser)
router.route("/login").post(registerUser)

export default router