import { Request } from "express";
import User from "../users/user.interface";

export default interface RequestWithUser extends Request {
  user: User;
}
