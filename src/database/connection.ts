import mongoose from "mongoose";
import logger from "../logger/logger";

import dotenv from "dotenv"
dotenv.config()

const db: any = process.env.DEV_DATABASE

const connection = async () => {
    mongoose.connect(db)
  .then(() => {
    logger.info("Connected to MongoDb");
  })
  .catch((error) => {
    logger.error("Error: ", error);
  })
}


export default connection