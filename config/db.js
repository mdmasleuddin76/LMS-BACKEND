import mongoose from "mongoose";
import app from "../app.js";
async function connection(){
    try{
     const {connection} =await mongoose.connect("mongodb://127.0.0.1:27017/LMS");
     app.listen(3000,()=>{
        console.log("app is listening on the port 3000")
    })
     console.log("Database Connected",connection.host);
    }
    catch(err){
        console.log("Database not Connected");
    }
}
export default connection;