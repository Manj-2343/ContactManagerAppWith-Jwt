import { Request, Response } from "express";
import { App_Status } from "../Constant/Constant";
import { validationResult } from "express-validator";
import ContactTable from "../Database/ContactSchema";
import { IContact } from "../Model/IContact";
import mongoose from "mongoose";
import { IUser } from "../Model/IUser";
import UserTable from "../Database/Model/UserSchema";

/** 
  usage : to get all contacts
  method :GET
  params :no-params(params means form data)
  url :http://localhost:9999/contacts/
  */

export const getAllContacts = async (request: Request, response: Response) => {
  try {
    const userObj: any = request.headers["user-data"];
    const userId = userObj.id;
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    const userData: IUser | undefined | null = await UserTable.findById(
      mongoUserId
    );
    if (!userData) {
      response.status(200).json({
        status: App_Status.Failed,
        data: null,
        error: "User is not found",
      });
    }
    let contacts: IContact[] | undefined = await ContactTable.find({
      user: new mongoose.Types.ObjectId(userId),
    });
    if (contacts) {
      return response.status(200).json({
        status: App_Status.Success,
        data: contacts,
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
  usage : to get a contact by id
  method :GET
  params :no-params(params means form data)
  url :http://localhost:9000/contacts/:id
  */
export const getContact = async (request: Request, response: Response) => {
  try {
    const userObj: any = request.headers["user-data"];
    const userId = userObj.id;
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    const userData: IUser | undefined | null = await UserTable.findById(
      mongoUserId
    );
    if (!userData) {
      response.status(200).json({
        status: App_Status.Failed,
        data: null,
        error: "User is not found",
      });
    }
    let { contactId } = request.params;
    if (contactId) {
      const mongoContactId = new mongoose.Types.ObjectId(contactId); //it convert string to mongodb supported id
      const contact: IContact | undefined | null = await ContactTable.findOne({
        _id: mongoContactId,
        user: mongoUserId,
      });
      if (!contact) {
        return response.status(404).json({
          status: App_Status.Failed,
          data: null,
          error: "NO contact found",
        });
      }
      return response.status(200).json({
        status: App_Status.Success,
        data: contact,
        msg: "",
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
   * usage : Create the  contacts
     method :Post
     params :name,imageUrl,email,mobile,company,title,groupId(because of this we use contact:IContact )
     url:http://localhost:9999/contacts/
   */
export const createContact = async (request: Request, response: Response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  try {
    const userObj: any = request.headers["user-data"];
    const userId = userObj.id;
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    const userData: IUser | undefined | null = await UserTable.findById(
      mongoUserId
    );
    if (!userData) {
      response.status(200).json({
        status: App_Status.Failed,
        data: null,
        error: "User is not found",
      });
    }
    //read the for data
    let { name, imageUrl, email, mobile, company, title, groupId } =
      request.body;
    //check if the mobile exist
    let contact = await ContactTable.findOne({ mobile: mobile });
    if (contact) {
      return response.status(400).json({
        statusbar: App_Status.Failed,
        error: "Mobile is Already exists",
      });
    }
    //create
    let theContactObj: IContact = {
      user: userId,
      name: name,
      imageUrl: imageUrl,
      email: email,
      company: company,
      title: title,
      groupId: groupId,
      mobile: mobile,
    };
    theContactObj = await new ContactTable(theContactObj).save();
    if (theContactObj) {
      return response.status(200).json({
        statusbar: App_Status.Success,
        data: theContactObj,
        msg: "Contact is Created",
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
/**this will be the add + create(contactId:string,contact:IContact)
   * 
*  usage  :Update the  contact
   method :PUT
   params :name.imageUrl,email.mobile,title,groupId
   url :http://localhost:9000/contacts/:contactId
   */
export const updateContact = async (request: Request, response: Response) => {
  let { contactId } = request.params;
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const userObj: any = request.headers["user-data"];
  const userId = userObj.id;
  const mongoUserId = new mongoose.Types.ObjectId(userId);
  const userData: IUser | undefined | null = await UserTable.findById(
    mongoUserId
  );
  if (!userData) {
    response.status(401).json({
      status: App_Status.Failed,
      data: null,
      error: "User is not found",
    });
  }
  try {
    //read the form data
    let { name, imageUrl, email, mobile, company, title, groupId } =
      request.body;
    //check if the mobile exist
    const mongoContactId = new mongoose.Types.ObjectId(contactId);
    let contact: IContact | null | undefined = await ContactTable.findOne({
      _id: mongoContactId,
      user: mongoUserId,
    });
    if (!contact) {
      return response.status(400).json({
        statusbar: App_Status.Failed,
        error: "Contact is not found...",
      });
    }
    //update
    let theContactObj: IContact | null = {
      name: name,
      imageUrl: imageUrl,
      email: email,
      company: company,
      title: title,
      groupId: groupId,
      mobile: mobile,
    };
    theContactObj = await ContactTable.findByIdAndUpdate(
      mongoContactId,
      {
        $set: theContactObj,
      },
      { new: true }
    ); // the { new: true } option, which returns the updated document.
    if (theContactObj) {
      return response.status(200).json({
        statusbar: App_Status.Success,
        data: theContactObj,
        msg: "Contact is Updated",
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
   * usage :Delete the  contact
   method :DELETE
   params :no-params(params means form data)
   url :http://localhost:9999/contacts/:contactId */
export const deleteContact = async (request: Request, response: Response) => {
  try {
    const userObj: any = request.headers["user-data"];
    const userId = userObj.id;
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    const userData: IUser | undefined | null = await UserTable.findById(
      mongoUserId
    );
    if (!userData) {
      response.status(401).json({
        status: App_Status.Failed,
        data: null,
        error: "User is not found",
      });
    }
    let { contactId } = request.params;
    if (contactId) {
      const mongoContactId = new mongoose.Types.ObjectId(contactId);
      const contact: IContact | undefined | null = await ContactTable.findOne({
        _id: mongoContactId,
        user: mongoUserId,
      });
      if (!contact) {
        return response.status(404).json({
          status: App_Status.Failed,
          data: null,
          error: "No contact found",
        });
      }
      let theContact: IContact | null = await ContactTable.findByIdAndDelete(
        mongoContactId
      );
      if (theContact) {
        return response.status(200).json({
          status: App_Status.Success,
          data: theContact,
          msg: "Contact is Deleted",
        });
      }
    }
  } catch (error: any) {
    return response.status(500).json({
      status: App_Status.Failed,
      data: null,
      error: error.message,
    });
  }
};
