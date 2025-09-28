// config/cloudinary.js
// chatbot-toeic-backend\src\config\cloudinary.js\
// https://cloudinary.com/documentation/node_integration
// https://cloudinary.com/documentation/image_upload_api_reference#upload_method

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
