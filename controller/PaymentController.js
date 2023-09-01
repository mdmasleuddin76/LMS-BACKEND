import { Razorpay } from "../index.js";
import PaymentModel from "../models/PaymentModel.js";
import UserModel from "../models/UserModel.js";
import AppError from "../utils/errorutils.js";
import crypto from "crypto";
const getrazorpaykey = async function (req, res, next) {
  res.status(200).json({
    succes: true,
    message: process.env.RAZORPAY_KEY_ID,
  });
};

const buysubscription = async function (req, res, next) {
  const { id } = req.user;
  const user = await UserModel.findById(id);
  if (!user) return next(new AppError("User not found", 500));
  if (user.role === "ADMIN")
    return next(new AppError("it is an admin account", 500));
  try {
    const subscription = await Razorpay.subscriptions.create({
      plan_id: process.env.PLAN_ID,
      customer_notify: 1,
      total_count: 10,
    });
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();
    res.status(200).json({
      succes: true,
      message: "subscribed successfully",
      subscription_id: subscription.id,
      total_count: 12,
    });
  } catch (e) {
    console.log(e);
    return next(new AppError(e.message, 500));
  }
};
const verifysubscription = async function (req, res, next) {
  const { id } = req.user;
  const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } =
    req.body;
  const user = await UserModel.findById(id);
  if (!user) return next(new AppError("User not found", 500));
  const subscriptionid = user.subscription.id;

  const generatesignature = await crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex");
  if (generatesignature !== razorpay_signature) {
    return next(new AppError("Payment not verified", 500));
  }
  PaymentModel.create({
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
  });
  user.subscription.status = "ACTIVE";
  await user.save();
  res.status(200).send("Payment Succesfull");
};
const cancelsubscription = async function (req, res, next) {
  const { id } = req.user;
  const user = await UserModel.findById(id);
  if (!user) return next(new AppError("User not found", 500));
  if (user.role === "ADMIN")
    return next(new AppError("it is an admin account", 500));
try {
  const subscriptionid = user.subscription.id;
  const cancelsubscription = await Razorpay.subscriptions.cancel(
    subscriptionid
  );
  user.subscription.status = cancelsubscription.status;
  await user.save();
  res.status(200).send("Subscription canceleld");
} catch (e) {
  console.log(e);
  return next(new AppError(e.message, 500));
}
};
const getallpayments = async function (req, res, next) {
  const { count } = req.query;
  try {
    const subscriptions = await Razorpay.subscriptions.all({
      count: count || 10,
    });
    res.status(200).json({
      succes:true,
      message:'all payments',
      subscription:subscriptions
    })

  } catch (e) {
    console.log(e);
    return next(new AppError(e.message,400));
  }
};

export {
  getrazorpaykey,
  buysubscription,
  verifysubscription,
  cancelsubscription,
  getallpayments,
};
