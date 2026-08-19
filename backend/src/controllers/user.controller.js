import { cookieOptions } from "../../constants.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { apiError as apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileupload.js";



const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if ([name, username, email, password].some(
    (field) => field?.trim() === ""
  )) {
    throw new apiError(400, "All fields are required");
  }

  const isUserPresent = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserPresent) {
    throw new apiError(400, "User already exists");
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
  });

  // console.log(user);

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new apiResponse(201, "User Registered Successfully", createdUser));
});




const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new apiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log(error);
    throw new apiError(500, "Error in generating access and refresh token");
  }
};




const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new apiError(400, "Either username or email is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select("+password");

  if (!user) {
    throw new apiError(404, "User does not exists , Please register first");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, "Invalid Credentials");
  }


  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


  const loggedInUser = await User.findById(user._id).select("-refreshToken");



  if (!loggedInUser) {
    throw new apiError(500, "Something went wrong while logging in");
  }


  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new apiResponse(200, "User logged in successfully", loggedInUser));


});



const getCurrentUser = asyncHandler(async (req, res) => {

  return res
    .status(200)
    .json(new apiResponse(200, "Current User Fetched Successfully", req.user))

})


const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
  )


  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new apiResponse(200, "User logged out successfully"))


})



const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized Access")
  }

  let decoded
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

  } catch (error) {
    throw new apiError(401, "Invalid or Expired Refresh Token");
  }
  const user = await User.findById(decoded?._id)

  if (!user) {
    throw new apiError(404, "User not found")
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new apiError(401, "Refresh Token is invalid or expired");
  }

  const { accessToken,
    refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new apiResponse(200, "Access token refreshed successfully"))

})




const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, skills, hobbies, gender, relationshipStatus, dateOfBirth, socialLinks, organization, college, designation, address } = req.body

  const updatedFields = {};

  if (name !== undefined && name.trim() === "") {
    throw new apiError(400, "Name cannot be empty");
  }

  if (name !== undefined) {
    updatedFields.name = name;
  }

  if (bio !== undefined) {
    updatedFields.bio = bio;
  }

  if (skills !== undefined) {
    updatedFields.skills = skills;
  }

  if (hobbies !== undefined) {
    updatedFields.hobbies = hobbies;
  }

  if (gender !== undefined) {
    updatedFields.gender = gender;
  }

  if (relationshipStatus !== undefined) {
    updatedFields.relationshipStatus = relationshipStatus;
  }

  if (dateOfBirth !== undefined) {
    updatedFields.dateOfBirth = dateOfBirth;
  }

  if (socialLinks !== undefined) {
    updatedFields.socialLinks = socialLinks;
  }

  if (organization !== undefined) {
    updatedFields.organization = organization;
  }

  if (college !== undefined) {
    updatedFields.college = college;
  }

  if (designation !== undefined) {
    updatedFields.designation = designation;
  }

  if (address !== undefined) {
    updatedFields.address = address;
  }

  if (Object.keys(updatedFields).length === 0) {
    throw new apiError(400, "No fields to update");
  }

  const user = await User.findByIdAndUpdate(req.user._id, updatedFields,
    {
      new: true,
      runValidators: true
    }
  ).select("-password -refreshToken")

  if (!user) {
    throw new apiError(404, "Failed to update profile")
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Profile Updated Successfully", user))

})



const updateAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req?.file?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    const currentUser = await User.findById(req.user._id)

    if (!currentUser) {
        throw new apiError(404, "User not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new apiError(500, "Failed to upload avatar")
    }

    if (currentUser.avatarPublicId) {
        await deleteFromCloudinary(currentUser.avatarPublicId)
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.secure_url,
                avatarPublicId: avatar.public_id
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new apiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new apiResponse(200,"Avatar updated successfully",user))
})


const updateCoverImage = asyncHandler(async (req, res) => {

  const localFilePath = req?.file?.path

  if (!localFilePath) {
    throw new apiError(400, "Cover image is required")
  }

  const currentUser = await User.findById(req.user._id)

  if (!currentUser) {
    throw new apiError(404, "User not found")
  }

  const coverImage = await uploadOnCloudinary(localFilePath)

  if (!coverImage) {
    throw new apiError(500, "Failed to upload cover image")
  }

  if (currentUser.coverImagePublicId) {
    await deleteFromCloudinary(currentUser.coverImagePublicId)
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.secure_url,
        coverImagePublicId: coverImage.public_id
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).select("-password -refreshToken")

  if (!user) {
    throw new apiError(404, "User not found")
  }

  return res
    .status(200)
    .json(new apiResponse(200,"Cover image updated successfully",user))
})


const getUserProfile = asyncHandler(async (req, res) => {

  const { username } = req.params
  // console.log(username)

  if(!username){
    throw new apiError(400, "Username is required")
  }

  const user = await User.findOne(
    {
      username : username.trim().toLowerCase()
    }
  ).select("-password -refreshToken")

  if(!user){
    throw new apiError(404,"User not found")
  }

  res
  .status(200)
  .json(new apiResponse(200,"Profile fetched successfully",user))

})






export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  getUserProfile,

};
