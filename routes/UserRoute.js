import Express from "express";
const router=Express.Router();
import { forgotpassword, getuser, logout, register, resetpassword, signin, updatepassword, updateprofile } from "../controller/UserController.js";
import {auth} from "../middleware/authmiddleware.js";
import upload from "../middleware/multermiddleware.js";

router.get('/logout',logout)
router.post('/register',upload.single('avatar'),register)
router.post('/login' ,signin)
router.get('/getuser',auth,getuser)
router.post('/forgot-password',forgotpassword)
router.post('/reset-password/:token',resetpassword)
router.post('/update-password',auth,updatepassword)
router.put('/profile-update',auth,upload.single('avatar'),updateprofile)
export default router;