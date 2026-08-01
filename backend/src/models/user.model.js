import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim: true
    },
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase: true,
        trim: true
    },
    password : {
        type : String,
        required : true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 250
    },
    skills : [{
        type : String
    }],
    hobbies : [{
        type : String
    }],
    gender : {
        type : String,
        enum : ["Male","Female","Other"]
    },
    married : {
        type : Boolean,
        default : false
    },
    relationshipStatus : {
        type : String,
        enum: [
        "Single",
        "In a Relationship",
        "Married",
        "Complicated"
        ]
    },
    dateOfBirth : {
        type : Date
    },
    socialLinks : {
    github: String,
    linkedin: String,
    twitter: String,
    portfolio: String
    },
    avatar : {
        type : String
    },
    coverImage : {
        type : String
    },
    organization : {
        type : String
    },
    college: {
        type: String,
        trim: true
    },
    designation : {
        type : String
    },
    address : {
        town : {
            type : String
        },
        city : {
            type : String
        },
        state : {
            type : String
        },
        country : {
            type : String
        },
        zipcode : {
            type : String,
            trim : true
        }
    }

},
{
    timestamps : true
})



// Password Hashing Middleware
userSchema.pre("save", async function () {

    // Agar password change nahi hua hai to dobara hash mat karo
    if (!this.isModified("password")) {
        return ;
    }

    // Password hash karo
    this.password = await bcrypt.hash(this.password, 10);

});




export const User = mongoose.model("User",userSchema)