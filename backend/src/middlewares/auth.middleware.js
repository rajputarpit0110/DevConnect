import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new apiError(401,"Unauthorized Access")
        }
    
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )
    
        // console.log(decoded)
    
        const fetchedUser = await User.findById(decoded._id).select("-refreshToken")
    
        if(!fetchedUser){
            throw new apiError(404,"User Not Found")
        }
    
        req.user = fetchedUser
    
        next()
    } catch (error) {
        throw new apiError(401, "Invalid or Expired Token")
    }

})