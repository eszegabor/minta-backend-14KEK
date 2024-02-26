import express, {Request, Response, NextFunction} from "express";
import IController from "interfaces/controller.inerface";
import { config } from "dotenv";
import mongoose from "mongoose";
import errorMiddleware from "./middleware/error.middleware";
import cookieParser from "cookie-parser";

export default class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: IController[]) {
    config(); // .env állomány tartalmát beolvassa a
    // process.env globális objektumba
    this.app = express();
    if (process.env.PORT) {
      this.port = parseInt(process.env.PORT);
    } else {
      this.port = 5000;
    }
    this.connectToDatabase(controllers);
  }

  private loggerMiddleware(request: Request, response: Response, next: NextFunction) {
    console.log(`${request.method} ${request.path} ${request.hostname}`);
    next();
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(this.loggerMiddleware)
  }

  private initializeControllers(controllers: IController[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }
  
  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }

  public connectToDatabase(controllers: IController[]) {
    const { MONGO_URI, MONGO_DB, PORT } = process.env;
    mongoose.connect(MONGO_URI as string, { dbName: MONGO_DB });

    mongoose.connection.on("connected", () => {
      // ha connected, akkor lépünk lépünk tovább
      console.log("Connected to MongoDB server.")
      this.initializeMiddlewares();
      this.initializeControllers(controllers);
      this.initializeErrorHandling();
    });

    mongoose.connection.on("error", error => {
      // hiba esetén:
      console.log(`Mongoose error: ${error.message}`);
    });
  }
}
