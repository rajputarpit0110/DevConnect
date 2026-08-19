import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { followUser, getFollowers, getFollowing, unfollowUser } from "../controllers/follow.controller.js";

const router = Router()

router.route("/:userId").post(verifyJWT,followUser).delete(verifyJWT,unfollowUser)
router.route("/:userId/followers").get(getFollowers)
router.route("/:userId/following").get(getFollowing)

export default router