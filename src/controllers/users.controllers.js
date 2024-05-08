import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists : email, username
    // upload health files to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username, email, password} = req.body

    if(
        [username, email, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new apiError(409, "User with email or username already exists")
    }

   // const healthLocalPath = req.files?.healthInfo[0]?.path;

    let healthLocalPath;
    if(req.files && Array.isArray(req.files.healthInfo) && req.files.healthInfo.length > 0){
        healthLocalPath = req.files.healthInfo[0].path
    }

    // if(!healthLocalPath) {
    //     throw new apiError(400, "Health file is required")
    // }
    console.log(req.files)
    console.log(healthLocalPath)

    const health = await uploadOnCloudinary(healthLocalPath)

    if(!health){
        throw new apiError(400, "Something went wrong while uploading image")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        healthInfo: health,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new apiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )

})

export {registerUser}