import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"



const register = asyncHandler(async (req, res) => {

    const {name, username, email, password} = req.body

    if(!name || !username || !email || !password) {
        throw new apiError(400, "All fields are required")
    }

    const isUserPresent = await User.findOne({
        $or : [{username} , {email}]
    })

    if(isUserPresent) {
        throw new apiError(400, "User already exists")
    }




    const user = await User.create({
        name,
        username,
        email,
        password
    })

    console.log(user)




    res.json({
        "name" : "Arpit"
    })
})






export {
    register
}