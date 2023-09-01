import Jwt from "jsonwebtoken";
import AppError from "../utils/errorutils.js";

const auth = async (req, res, next) => {
  let token = null;
  if (req.cookies && req.cookies.token) token = req.cookies.token;
  try {
    if (token) {
      const payload = await Jwt.verify(token, process.env.SECRET_KEY);
      req.user = {
        id: payload.id,
        email: payload.email,
        subscription: payload.subscription,
        role: payload.role,
      };
      next();
    } else {
      res.status(500).send("token did not found");
    }
  } catch (e) {
    console.log(e)
    res.status(500).send(e.message);
  }
};
const isadmin = (...role) => async (req, res, next) => {
    const userrole = req.user.role;
    if (!role.includes(userrole)) {
        return next(new AppError("Not Authorized", 500));
    }
    next();
};

export { auth, isadmin };
