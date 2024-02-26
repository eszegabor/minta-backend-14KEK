import { IsString } from "class-validator";
import IPost from "./post.interface";

export default class CreatePostDto implements IPost {
  @IsString()
  public author: string;

  @IsString()
  public content: string;

  @IsString()
  public title: string;
}
