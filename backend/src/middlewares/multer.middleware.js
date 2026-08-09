import multer from "multer";
import crypto from "crypto"
import path from "path";

const storage = multer.diskStorage({
    destination : function(req, file, cb){

        const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`

        cb(null, uniqueName)
    },

    filename : function(req, file, cb){
        cb(null, file.originalname)
    }
})

export const uploads = multer({
    storage
})