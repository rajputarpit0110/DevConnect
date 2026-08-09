import mongoose from "mongoose";

const followSchema = mongoose.Schema({
    follower : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    following : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
},
{
    timestamps : true
})


// Same user ko same user dobara follow nahi kar sakta
followSchema.index(
  {
    follower: 1,
    following: 1,
  },
  {
    unique: true,
  }
);



export const Follow = mongoose.model("Follow",followSchema);