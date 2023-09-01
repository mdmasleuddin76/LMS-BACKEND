import app from "./app.js";
import connection from "./config/db.js";
import cloudinary from 'cloudinary'
import razorp from 'razorpay'
cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
export const Razorpay=new razorp({
    key_id:process.env.KEY_ID,
    key_secret:process.env.KEY_SECRET
})
connection();