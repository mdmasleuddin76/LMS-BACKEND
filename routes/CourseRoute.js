import express from "express";
import { addcourse, addlectures, deletecourse, getallcourse, getcoursebyid,updatecourse } from "../controller/CourseController.js";
import {auth, isadmin} from "../middleware/authmiddleware.js";
import upload from "../middleware/multermiddleware.js";

const router=express.Router();

router.get('/',auth,getallcourse)
router.get('/:id',auth,getcoursebyid)
router.post('/',auth,isadmin('ADMIN'),upload.single('thumbnail'),addcourse)
router.put('/:id',auth,isadmin('ADMIN'),upload.single('thumbnail'),updatecourse)
router.delete('/:id',auth,isadmin('ADMIN'),deletecourse)
router.post('/:id',auth,isadmin('ADMIN'),upload.single('video'),addlectures)
export default router;