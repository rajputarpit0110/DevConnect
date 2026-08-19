import { Router } from "express";
import { getCurrentUser, getUserProfile, loginUser, registerUser, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploads } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/avatar").patch(verifyJWT,uploads.single("avatar"),updateAvatar)
router.route("/cover-image").patch(verifyJWT,uploads.single("coverImage"),updateCoverImage)
router.route("/profile/:username").get(getUserProfile)

export default router