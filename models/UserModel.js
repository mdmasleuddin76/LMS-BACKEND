import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import crypto from 'crypto'
const UserSchema = new Schema({
  fullname: {
    type: String,
    required: [true, "Name is Required"],
    minLength: [5, "name Shold be of atleast 5 Characters"],
    uppercase: true,
    trim: true,
  },
  email: {
    type: String,
    unique: [true, "Email should be Unique"],
    required: [true, "Email is Required"],
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    minLength: [8, "pasword must be of atleast 8 Word"],
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirm Password is Required"],
    minLength: [8, " confirm pasword must be of atleast 8 Word"],
    select: false,
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
  avatar: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  forgotpasswordtoken: String,
  forgotpasswordExpiry: String,
  subscription:{
    id:String,
    status:String
  }
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltval = parseInt(process.env.SALTVALUE) || 10;
  try {
    this.password = await bcrypt.hash(this.password, saltval);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, saltval);
  } catch (err) {
    console.log("its an error", err);
  }
  return next();
});

UserSchema.methods = {
  // ******************JWTTOKEN*************************
  generateJWTtoken: async function () {
    const SECRET_KEY = process.env.SECRET_KEY || 200;
    return await Jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      SECRET_KEY,
      { expiresIn: "24h" }
    );
  },

  //*********************************forgotpasswordtokrn*****************************/
    
  resetpasswordtoken:async function(){
      const resettoken=crypto.randomBytes(20).toString('hex');
      this.forgotpasswordtoken=crypto.createHash('sha256').update(resettoken).digest('hex');
      this.forgotpasswordExpiry=Date.now()+15*60*1000;
      return resettoken;
  }


};
export default model("User", UserSchema);
