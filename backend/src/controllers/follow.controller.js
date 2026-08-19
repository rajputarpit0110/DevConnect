import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const followUser = asyncHandler( async (req, res) => {
    const { userId } = req.params

    if(!userId){
        throw new apiError(400,"User id is required")
    }

    if (req.user._id.toString() === userId.toString()) {
        throw new apiError(400, "You cannot follow yourself");
    }

    const userToFollow = await User.findById(userId).select("-password -refreshToken")

    if(!userToFollow){
        throw new apiError(404,"User not found")
    }

    const alreadyFollowing = await Follow.findOne({
        follower : req.user._id,
        following : userId
    })

    if(alreadyFollowing){
        throw new apiError(409, "You are already following this user")
    }

    const follow = await Follow.create({
        follower : req.user._id,
        following : userId
    })

    if(!follow){
        throw new apiError(500, "Error in following")
    }

    return res
            .status(201)
            .json(new apiResponse(201,"User successfully followed",follow))

} )



const unfollowUser = asyncHandler(async (req, res) => {

  const { userId } = req.params

  if (!userId) {
    throw new apiError(400, "User ID is required")
  }

  const unfollow = await Follow.findOneAndDelete({
    follower: req.user._id,
    following: userId
  })

  if (!unfollow) {
    throw new apiError(404,"You are not following this user")
  }

  return res
    .status(200)
    .json(new apiResponse(200,"User unfollowed successfully",unfollow))
})



const getFollowers = asyncHandler( async (req, res) => {

    const { userId } = req.params

    if(!userId){
        throw new apiError(400, "UserId is required")
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)

    if(!user){
        throw new apiError(404, "User not found")
    }

    const follower = await Follow.find({
        following: userId
    })
    .populate(
      "follower",
      "-password -refreshToken"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalFollowers = await Follow.countDocuments({
    following : userId
  })

  return res
    .status(200)
    .json(new apiResponse(200,"Follower fetched successfully",
        {
          follower,
          pagination: {
            page,
            limit,
            totalFollowers,
            totalPages: Math.ceil(totalFollowers / limit),
            hasNextPage: page < Math.ceil(totalFollowers / limit)
          }
        }
      )
    )
})




const getFollowing = asyncHandler(async (req, res) => {

  const { userId } = req.params

  if (!userId) {
    throw new apiError(400, "User ID is required")
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = Math.min(parseInt(req.query.limit) || 10,50)
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const following = await Follow.find({
    follower: userId
  })
    .populate(
      "following",
      "-password -refreshToken"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalFollowing = await Follow.countDocuments({
    follower: userId
  });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        "Following fetched successfully",
        {
          following,
          pagination: {
            page,
            limit,
            totalFollowing,
            totalPages: Math.ceil(
              totalFollowing / limit
            ),
            hasNextPage:
              page <
              Math.ceil(totalFollowing / limit)
          }
        }
      )
    )
})




export {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing

}