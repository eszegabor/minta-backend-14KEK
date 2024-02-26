import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.inerface";
import IPost from "./post.interface";
import postModel from "./posts.model";
import PostNotFoundException from "../exceptions/PostNotFoundException";
import HttpException from "../exceptions/HttpException";
import validationMiddleware from "../middleware/validation.middleware";
import CreatePostDto from "./post.dto";
import authMiddleware from "../middleware/auth.middleware";

export default class PostsController implements Controller {
  public path = "/posts";
  public router = Router();
  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, authMiddleware,  this.getAllPosts); // ok
    this.router.get(`${this.path}/:id`, this.getPostById); //ok
    this.router.patch(
      `${this.path}/:id`,
      validationMiddleware(CreatePostDto, true),
      this.modifyPost
    ); //ok
    this.router.delete(`${this.path}/:id`, this.deletePost);
    this.router.post(
      this.path,
      validationMiddleware(CreatePostDto),
      this.createPost
    ); // ok
  }

  private getAllPosts = (request: Request, response: Response) => {
    this.post.find().then((posts) => {
      response.send(posts);
    });
  };

  private getPostById = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const id = request.params.id;
    this.post
      .findById(id)
      .then((post) => {
        if (post) {
          response.send(post);
        } else {
          next(new PostNotFoundException(id));
        }
      })
      .catch((error) => {
        next(new HttpException(500, error.message));
      });
  };

  private modifyPost = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const id = request.params.id;
    const postData: IPost = request.body;
    this.post
      .findByIdAndUpdate(id, postData, { new: true })
      .then((post) => {
        if (post) {
          response.send(post);
        } else {
          next(new PostNotFoundException(id));
        }
      })
      .catch((error) => {
        next(new HttpException(500, error.message));
      });
  };

  private createPost = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const postData: IPost = request.body;
    const createdPost = new this.post(postData);
    createdPost
      .save()
      .then((savedPost) => {
        response.send(savedPost);
      })
      .catch((error) => {
        next(new HttpException(500, error.message));
      });
  };

  private deletePost = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const id = request.params.id;
    this.post
      .findByIdAndDelete(id)
      .then((successResponse) => {
        if (successResponse) {
          response.sendStatus(200);
        } else {
          next(new PostNotFoundException(id));
        }
      })
      .catch((error) => {
        next(new HttpException(500, error.message));
      });
  };
}
