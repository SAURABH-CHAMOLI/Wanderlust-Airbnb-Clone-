//code to access the cloudinary account

const cloudinary=require("cloudinary").v2;
const {CloudinaryStorage}=require('multer-storage-cloudinary') 

cloudinary.config({                  //code to establish the connect between backened and cloudinary 
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage=new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder:'wanderlust_DEV',                 //folder name to store files
        allowedFormats: ['png','jpeg','jpg'],
    }
})

module.exports={
    cloudinary,
    storage
}