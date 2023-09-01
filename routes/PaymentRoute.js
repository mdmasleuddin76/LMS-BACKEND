import { Router } from "express";
import { buysubscription, cancelsubscription, getallpayments, getrazorpaykey, verifysubscription } from "../controller/PaymentController.js";
import { auth, isadmin } from "../middleware/authmiddleware.js";

const router=Router();


router.get('/razorpay-key',auth,getrazorpaykey)
router.post('/subscribe',auth,buysubscription)
router.post('/verify',auth,verifysubscription)
router.post('/unsubscribe',auth,cancelsubscription)
router.get('/',auth,isadmin('ADMIN'),getallpayments)

export default router;