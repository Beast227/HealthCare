import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/users.models.js"
import { Doctor } from "../models/doctor.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken";
import { Medicine } from "../models/medicine.models.js"
import pkg from 'twilio';
const { Twilio } = pkg;

// need to unserstand the concept
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists : email, username
    // upload health files to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username, email, password, userPhone, careTakerPhone} = req.body

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

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        careTakerPhone,
        userPhone
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

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const {email, username, password} = req.body
    console.log(req.body)

    if(!username && !email){
        throw new apiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new apiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logOutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new apiResponse(200, {}, "User logged Out"))
})

// need to understand the concept
const refreshAccessToken = asyncHandler( async (req, res) => {
    try {
        const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        
        if(!IncomingRefreshToken) {
            throw new apiError(401, "Unautorized request")
        }
    
        const decodedToken = jwt.verify(
            IncomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new apiError(401, "Invalid refresh token")
        }
    
        if(IncomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new apiResponse(
                200, 
                {
                    accessToken, refreshToken: newrefreshToken 
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassworrd = asyncHandler(async(req, res) => {
    const {oldPasword, newPasswrod} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPasword)

    if(!isPasswordCorrect){
        throw new apiError(400, "Invalid old password")
    }

    user.password = newPasswrod
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) =>{
    
    const user = req.user

    if(!user) {
        throw new apiError(401, "User not found")
    }

    return res
    .status(200)
    .json(200, user, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {email} = req.body

    if(!email) {
        throw new apiError(400, "All fields are required")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email: email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"))
})

//continue with the video later 
const updateUserMedicinePhoto = asyncHandler(async(req, res)=> {
    const medicineLocalPath = req.file?.path

    if(!medicineLocalPath) {
        throw new apiError(400, "Medicine file is missing")
    }

    const medicine = await uploadOnCloudinary(medicineLocalPath)

    if(!medicine) {
        throw new apiError(400, "Error while uploading on avatar")
    }

    await Medicine.findByIdAndUpdate(
        req.user?._id,
        {

        },
        {new: true}
    ).select("-password")
})

const doctorDetails = asyncHandler(async(req, res) => {
    const {doctorName, hospitalName, doctorPhone, hospitalPhone} = req.body

    const user = req.user
    const doctor = await Doctor.findOne(doctorPhone)

    if(doctor) {

        doctor.user.push(user._id)
        doctor.save()

        return res
        .status(200)
        .json(
            new apiResponse(200, doctor, "Doctor was already present")
        )
    }

    if(!user) {
        throw new apiError(401, "Login First")
    }

    if(
        [doctorName, hospitalName, doctorPhone, hospitalPhone].some((field) =>
            field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    doctor = Doctor.create({
        doctorName,
        hospitalName,
        doctorPhone,
        hospitalPhone,
        user: user._id
    })

    const createdDoctor = await Doctor.findById(doctor._id)

    if(!createdDoctor) {
        throw new apiError(401, "Something went wrong while creating doctor details")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, doctor, "Doctor created successfully")
    )

})

const getdoctorDetails = asyncHandler(async (req, res) => {

    const user = req.user

    if(!user) {
        throw new apiError(401, "Login first")
    }

    const doctor = await Doctor.findOne(user)

    if(!doctor) {
        throw new apiError(401, "Unauthorized access")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, "Doctor details are present")
    )
})

const messageApi = asyncHandler(async(req, res) => {

    const user = req.user

    if(!user) {
        throw new apiError(401, "Login required")
    }

    const phone_no = user.careTakerPhone

    const accountSid = process.env.ACCOUNT_SID;
    const authToken =  process.env.AUTH_TOKEN;
    const client = new Twilio(accountSid, authToken);

    client.messages
    .create({
        body: `Time to take the medicine ${user.username}`,
        
        from: '+13142074644',
        to: '+91' + phone_no
    })
    .then(message => console.log(message.sid));
})

const medicineDetails = asyncHandler(async(req, res) =>{
    const {medName, dosage} = req.body
    if(
        [medName, dosage].some((field) =>
            field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const user = req.user
    console.log(user)

    if(!user) {
        throw new apiError(401, "Login First")
    }

    let medicinePhotoPath;
    if(req.files && Array.isArray(req.files.medicineImage) && req.files.medicineImage.length > 0){
        medicinePhotoPath = req.files.medicineImage[0].path
    }

    const medicineUrl = await uploadOnCloudinary(medicinePhotoPath)

    const medicine = await Medicine.create(
            {
                medName,
                dosage,
                medicineImage: medicineUrl || "",
                user
            })

    return res
    .status(200)
    .json(
        new apiResponse(200, medicine, "Medicine details are saved")
    )

})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassworrd,
    getCurrentUser,
    updateAccountDetails,
    medicineDetails,
    doctorDetails,
    getdoctorDetails,
    messageApi
}