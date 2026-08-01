import { Router } from "express";
import { register } from "../controllers/user.controller.js";

const router = Router()

router.route("/").get(register)

export default router