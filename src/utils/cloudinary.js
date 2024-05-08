import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: 'doqygkohh',
    api_key: 819978846583535,
    api_secret: 'nY5AlbjG6ICRkFXOY7jukyj91dA'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File is uploaded on cloudinary ", response.url);
        return response.url;
    } catch (error) {
        fs.unlinkSync(localFilePath)// remove the locally saved temporary file as the upload got failed
        console.log(error)
        return null
    }
}

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });

export {uploadOnCloudinary}