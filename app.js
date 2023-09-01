import express  from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import {config} from 'dotenv'
import morgan from "morgan";
import Router1 from "./routes/UserRoute.js";
import Router2 from './routes/CourseRoute.js'
import Router3 from './routes/PaymentRoute.js'
import { urlencoded } from "express";
import errormiddleware from "./middleware/errormiddleware.js";
config();
const app=express();
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(urlencoded({extended:true}))
app.use('/v1',Router1);
app.use('/v1/course',Router2);
app.use('/v1/payment',Router3);
app.use(errormiddleware)
export default app;