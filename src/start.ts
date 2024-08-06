import app from "./index"
import logger from "./logger/logger";

import dotenv from "dotenv"

dotenv.config()
const port: any = process.env.PORT

app.listen(port, () => {
    logger.info("server is running");
})