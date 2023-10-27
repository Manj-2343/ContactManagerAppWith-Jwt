import { validationResult } from "express-validator";
import { App_Status } from "../Constant/Constant";
import { Request, Response } from "express";
import UserTable from "../Database/Model/UserSchema";
import bcryptjs from "bcryptjs";
import gravatar from "gravatar";
import { IUser } from "../Model/IUser";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


/** 
  usage : register a User
  method :POST
  params :username,email,password
  url :http://localhost:9000/users/register
  access :Public
  */
export const registerUser = async (request: Request, response: Response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  try {
    //read the for data
    let { username, email, password } = request.body;
    //check if the user is exits
    const userObj = await UserTable.findOne({ email: email });
    if (userObj) {
      return response.status(400).json({
        statusbar: App_Status.Failed,
        data: null,
        error: "The user is already exist..",
      });
    }
    //password encryption
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    //gravatar url
    const imageUrl = gravatar.url(email, {
      size: "200",
      rating: "pg",
      default: "mm",
    });
    //insert to db
    const newUser: IUser = {
      username: username,
      email: email,
      password: hashPassword,
      imageUrl: imageUrl,
      isAdmin: false,
    };
    //save the data to db
    const theUserObj = await new UserTable(newUser).save();
    if (theUserObj) {
      return response.status(200).json({
        statusbar: App_Status.Success,
        data: theUserObj,
        msg: "Registration is success..",
      });
    }
  } catch (error: any) {
    return response.status(500).json({
      status: App_Status.Failed,
      data: null,
      error: error.message,
    });
  }
};
/** 
  usage : Login A  User
  method :POST
  params :email,password
  url :http://localhost:9000/users/register
  access :Public
  */
export const LoginUser = async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
  try {
    //read the form data
 let {email,password} = request.body;
    //check for the email
const userObj:IUser|undefined|null = await UserTable.findOne({email:email});
if(!userObj){
    return response.status(500).json({
        status: App_Status.Failed,
        data: null,
        error: "Invalid Email Address",
      });
}
    //check the password(1st you should decrypt then check )
let isMatch:boolean = await bcryptjs.compare(password,userObj.password)
if(!isMatch){
    return response.status(500).json({
        status: App_Status.Failed,
        data: null,
        error: "Invalid Password",
      });
}
    //create a token
   const secreteKey:string|undefined = process.env.JWT_SECRET_KEY;
   const payload:any={    //when i scan back  i want who is login
    user:{
        id:userObj._id,
        email:userObj.email
    }
   };
if(secreteKey &&  payload){
     jwt.sign(payload,secreteKey,{
        expiresIn:12000000000
    },(error,encoded)=>{
     if(error) throw error;
     if(encoded){
        return response.status(200).json({
            status: App_Status.Success,
            data: userObj,
            token:encoded,
            msg:"Login Is Success.."
          }); 
     }
    });
}

    //send response
  } catch (error: any) {
    return response.status(500).json({
      status: App_Status.Failed,
      data: null,
      error: error.message,
    });
  }
};
/** 
  usage : Login User Info
  method :GET
  params :no-params
  url :http://localhost:9000/users/me
  access :Private
  */
  export const getUserInfo = async (request: Request, response: Response) => {
  try {
   const userObj:any = request.headers['user-data'];
   const userId =userObj.id;
   const mongoUserId =new mongoose.Types.ObjectId(userId);
   const userData:IUser|undefined | null = await UserTable.findById(mongoUserId)
   if(userData){
    response.status(200).json({
        status: App_Status.Success,
      data: userData,
    })
   }
  } catch (error: any) {
    return response.status(500).json({
      status: App_Status.Failed,
      data: null,
      error: error.message,
    });
  }
};