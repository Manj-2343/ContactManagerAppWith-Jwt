import {Router,Request,Response} from "express";
import * as UserController from "../Controller/UserController"
import {body} from "express-validator";
import { TokenMiddleware } from "../Middleware/TokenMiddleWare";


const UserRouter:Router = Router();

/** 
  usage : register a User
  method :POST
  params :userName,email,password
  url :http://localhost:9000/users/register
  */
  UserRouter.post("/register",[
    body("username").not().isEmpty().withMessage("UserName is Required"),
    body("email").isEmail().withMessage("Proper Email is Required"),
    body("password").isStrongPassword().withMessage("Strong Password  is Required"),
 ],async(request:Request,response:Response)=>{
    await UserController.registerUser(request,response);
  });

/** 
  usage : register a User
  method :POST
  params :userName,email,password
  url :http://localhost:9000/users/login
  */
  UserRouter.post("/login",[
    body("email").isEmail().withMessage("Proper Email is Required"),
    body("password").isStrongPassword().withMessage("Strong Password  is Required"),
 ],async(request:Request,response:Response)=>{
    await UserController.LoginUser(request,response);
  });
/** 
  usage : get User Info
  method :GET
  params :userName,email,password
  url :http://localhost:9000/users/me
  */
  UserRouter.get("/me",TokenMiddleware,async(request:Request,response:Response)=>{
    await UserController.getUserInfo(request,response);
  });
export default UserRouter;