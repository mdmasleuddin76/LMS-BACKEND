import { publicDecrypt } from "crypto";
import CourseModel from "../models/CourseModel.js";
import AppError from "../utils/errorutils.js";
import cloudinary from "cloudinary";
import fs from "fs";
//**********************************GETALLLECTURES********************/

const getallcourse = async function (req, res, next) {
  try {
    const course = await CourseModel.find({}).select("-lectures");
    if (course.length > 0) res.status(200).send(course);
    else res.status(401).send("Course is not Available");
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

//******************************************GETALLLECTURESBYID************/

const getcoursebyid = async function (req, res, next) {
  try {
    const { id } = req.params;
    console.log(id);
    if (!id) return next(new AppError("id is not found", 500));
    const course = await CourseModel.findById(id);
    if (course) {
      res.status(201).send(course.lectures);
    } else return next(new AppError("course not found", 500));
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

//************************************CREATECOURSE*********************/

const addcourse = async function (req, res, next) {
  const { title, description, category, createdby } = req.body;
  if (!title) return next(new AppError("Title required", 400));
  try {
    const course = await CourseModel.create({
      title,
      description,
      category,
      createdby,
    });
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "course",
        });
        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
          fs.rm(`uploads/${req.file.filename}`, () => {});
        }
        await course.save();
      } catch (e) {
        return next(
          new AppError(
            `there is something error in file uploading ${e.message}`
          ),
          500
        );
      }
    }
    res.status(200).send("course added");
  } catch (e) {
    return next(new AppError("There is something error in creating", 400));
  }
};

//************************************UPDATTECOURSE*********************/

const updatecourse = async function (req, res, next) {
  const { id } = req.params;
  if (!id) return next(new AppError("id is not valid", 400));
  try {
    const course = await CourseModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { runValidators: true }
    );
    if (!course)
      return next(new AppError("course is not found by this id", 400));
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "course",
      });
      if (result) {
        if (course.thumbnail.public_id)
          await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
        fs.rm(`uploads/${req.file.filename}`, () => {});
      }
    }
    await course.save();
    res.status(200).json({
      succes: true,
      message: "course Updated",
      updated_course: `upadted course is  ${course}`,
    });
  } catch (err) {
    return next(
      new AppError(
        `There is something error please try again later.....${err.message}`,
        500
      )
    );
  }
};

//************************************DELETECOURSE*********************/

const deletecourse = async function (req, res, next) {
  const { id } = req.params;
  if (!id) return next(new AppError("id is not valid", 400));
  try {
    const course = await CourseModel.findById(id);
    if (!course)
      return next(new AppError("course is not found by this id", 400));
    const temp = await cloudinary.v2.uploader.destroy(
      course.thumbnail.public_id
    );
    const result = await CourseModel.findByIdAndDelete(id);
    res.status(200).send("Course deleted");
  } catch (e) {
    return next(
      new AppError(`Something Error in deletion....${e.message}`, 400)
    );
  }
};

//**********************************************ADDLECTURES*************************/

const addlectures = async function (req, res, next) {
  const { id } = req.params;
  if (!id) return next(new AppError("id is not found", 500));
  const course = await CourseModel.findById(id);
  if (!course) return next(new AppError("course is not found by this id", 500));
  const { title, description } = req.body;
  if (!title || !description)
    return next(new AppError("title and description must be provided"), 500);
  try {
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "LectureVideos",
      });
      if (result) {
        const temp = {
          title: title,
          description: description,
          lecture: {
            public_id: result.public_id,
            secure_url: result.secure_url,
          },
        };
        course.lectures.push(temp);
        course.nooflecture=course.lectures.length;
        await course.save();
        res.status(200).send("Lecture Added");
      } else {
        return next(new AppError("There is an error in File uploading", 500));
      }
    } else {
      return next(new AppError("video has not been uploaded", 500));
    }
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};
export {
  getallcourse,
  getcoursebyid,
  addcourse,
  updatecourse,
  deletecourse,
  addlectures,
};
