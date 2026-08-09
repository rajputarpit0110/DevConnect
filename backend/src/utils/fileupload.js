import { cloudinary } from "./cloudinary.js";
import fs from "fs"


const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type : "auto",
            }
        )

        console.log("File uploaded on cloudinary ",response.url)

        fs.unlinkSync(localFilePath)

        return response
        
    } catch (error) {
        console.log("Error in file uploading ", error)

        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath)
        }
        return null
    }
}


const deleteFromCloudinary = async (publicId) => {
    
    try {
        if(!publicId){
            console.log("PublicId is required")
            return null
        }
        const response = await cloudinary.uploader.destroy(publicId)

        console.log("Cloudinary response : ",response)

        return response

    } catch (error) {
        console.log("Error in file deletion from cloudinary ",error)
        return null
    }




}


export {
    uploadOnCloudinary,
    deleteFromCloudinary

}