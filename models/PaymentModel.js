import { Schema,model } from "mongoose";

const payment=new Schema({
   payment_id:{
    type:String,
    required:true
   },
   subscription_id:{
    type:String,
    required:true
   },
   signature:{
    type:String,
    required:true
   }
},{timestamps:true})

export default model('Payment',payment);