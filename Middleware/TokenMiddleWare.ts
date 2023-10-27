import {Request,Response,NextFunction} from "express";
import { App_Status } from "../Constant/Constant";
import  Jwt  from "jsonwebtoken";

export const TokenMiddleware =async(request:Request,response:Response,next:NextFunction) =>{
    try{
        const secreteKey:string|undefined = process.env.JWT_SECRET_KEY;
        const token:string |string[]| undefined = request.headers['x-auth-token'];
        if(secreteKey && token){
           const decode:any= await Jwt.verify(token.toString(),secreteKey);
           if(decode){
            request.headers['user-data'] = decode.user;
            next();
           }
           else{
            return response.status(401).json({
                status: App_Status.Failed,
                data: null,
                error: "UnAuthorized ,Invalid token",   
              }); 
           }
        }   
        else{
            return response.status(400).json({
                status: App_Status.Failed,
                data: null,
                error: "No Token Provided.. ",
              }); 
        }
    }
    catch(error:any){
        return response.status(500).json({
            status: App_Status.Failed,
            data: null,
            error: error.message,
          });
    }
}