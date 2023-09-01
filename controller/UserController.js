import UserModel from "../models/UserModel.js";
import AppError from "../utils/errorutils.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import fs from "fs";
import sendemail from "../utils/sendemail.js";
import crypto from "crypto";
const coockieoption = {
  maxAge: 24 * 7 * 60 * 60 * 1000,
  httpOnly: true,
  // secure:true
};

// ******************************GETUSER*********************************

async function getuser(req, res, next) {
  try {
    const id = req.user.id;
    const user = await UserModel.findById(id);
    res.status(200).json({
      name: user.fullname,
      email: user.email,
    });
  } catch (err) {
    return next(new AppError("Failed to fetch User Profile", 500));
  }
}

//******************************************REGISTER*******************************/

async function register(req, res, next) {
  const { fullname, email, password, confirmPassword } = req.body;
  if (!fullname || !email || !password || !confirmPassword) {
    return next(new AppError("All fields are Required", 404));
  }
  if (password != confirmPassword)
    return next(
      new AppError("password and ConfirmPassword should be same", 404)
    );
  const userexist = await UserModel.findOne({ email });
  if (userexist)
    return next(new AppError("User already exist with this email", 500));
  try {
    const user = await UserModel.create({
      fullname,
      email,
      password,
      confirmPassword,
    });
    if (!user) return next(new AppError("User REgistration failed", 400));
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
          fs.rm(`uploads/${req.file.filename}`, (err) => {
            if (err) {
              console.error("Error removing file:", err);
            } else {
              console.log("File removed successfully");
            }
          });
        } else {
          await UserModel.deleteOne({ email: user.email });
        }
        await user.save();
      } catch (e) {
        await UserModel.deleteOne({ email: user.email });
        return next(
          new AppError(
            `there is something error in file uploading ${e.message}`
          ),
          500
        );
      }
    }
    const token = await user.generateJWTtoken();
    res.cookie("token", token, coockieoption);
    res.status(200).send("you are now registered");
  } catch (err) {
    console.log(err);
  }
}

/**************************************LOGIN*************************************/

async function signin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError("All fields are Required", 400));
    const user = await UserModel.findOne({ email });
    if (!user) return next(new AppError("User does not Exist", 400));
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = await user.generateJWTtoken();
      res.cookie("token", token, coockieoption);
      res.status(200).send("User Logged in");
    } else {
      return next(new AppError("You Entered Wrong Password", 400));
    }
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
}

/*****************************************LOGOUT***************************************/

function logout(req, res) {
  res.cookie("token", null, {
    maxAge: 0,
    httpOnly: true,
    secure: true,
  });
  res.status(200).send("User logged out");
}

/***********************************FORGOT-PASSWORD*********************************/

async function forgotpassword(req, res, next) {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is Required", 400));
  const user = await UserModel.findOne({ email });
  if (!user)
    return next(new AppError("User does not Exist Enter a valid email", 400));
  try {
    const token = await user.resetpasswordtoken();
    await user.save();
    const reseturl = `http://localhost:3000/v1/reset-password/${token}`;
    const subject = "RESET PASSWORD";
    const message = `To reset the password click on the given link ${reseturl}`;
    await sendemail(email, subject, message);
    res.status(200).send("email sent");
  } catch (e) {
    user.forgotpasswordtoken = undefined;
    user.forgotpasswordExpiry = undefined;
    await user.save();
    res.send(e.message);
  }
}

/******************************************RESET-PASSWORD********************************/

async function resetpassword(req, res, next) {
  const { token } = req.params;
  const { password } = req.body;
  const restoken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await UserModel.findOne({
    forgotpasswordtoken: restoken,
    forgotpasswordExpiry: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token expired", 500));
  try {
    user.password = password;
    user.confirmPassword = password;
    user.forgotpasswordExpiry = undefined;
    user.forgotpasswordtoken = undefined;
    await user.save();
    res.status(200).send("Password changed");
  } catch (e) {
    res.status(400).send(e.message);
  }
}

//********************************UPDATEPASSWORD*************************/

const updatepassword = async function (req, res, next) {
  const { password, newpassword, newconfirmpassword } = req.body;
  if (!password || !newpassword || !newconfirmpassword)
    return next(new AppError("All fields are required", 400));
  const email = req.user.email;
  const user = await UserModel.findOne({ email });
  const result = await bcrypt.compare(password, user.password);
  try {
    if (result) {
      user.password = newpassword;
      user.confirmPassword = newconfirmpassword;
      await user.save();
      res.status(200).send("password changed succesfully");
    } else {
      res.status(404).send("you Entered wrong password");
    }
  } catch (e) {
    return next(
      new AppError("There is something error password has not been changed")
    );
  }
};

//*************************************UPDATEPROFILE**************************/

const updateprofile = async function (req, res, next) {
  const { fullname } = req.body;
  const id = req.user.id;
  const user = await UserModel.findById(id);
  if (!user) return next(new AppError("user does not exist", 500));
  if (fullname) user.fullname = fullname;
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (result) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
        fs.rm(`uploads/${req.file.filename}`, (err) => {
          if (err) {
            console.error("Error removing file:", err);
          } else {
            console.log("File removed successfully");
          }
        });
        res.status(200).send('Profile Updated');
      }
    } catch (e) {
      return next(
        new AppError(`there is something error in file uploading ${e}`),
        500
      );
    }
    await user.save();
  }
};
export {
  getuser,
  register,
  signin,
  logout,
  forgotpassword,
  resetpassword,
  updatepassword,
  updateprofile,
};
