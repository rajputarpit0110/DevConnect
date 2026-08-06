import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


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
        required : true,
        select : false,
        minlength : 8
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 250
    },
    skills: [{
        type: String,
        trim: true
    }],
    hobbies: [{
        type: String,
        trim: true
    }],
    gender : {
        type : String,
        enum : ["Male","Female","Other"]
    },
    relationshipStatus : {
        type : String,
        enum: [
        "Single",
        "In a Relationship",
        "Married",
        "Complicated"
        ],
        default: "Single"
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
        type : String,
        default : ""
    },
    coverImage : {
        type : String,
        default : ""
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
    },
    refreshToken : {
        type : String
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



userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    
}


userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}




export const User = mongoose.model("User",userSchema)