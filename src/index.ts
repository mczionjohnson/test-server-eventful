import express from "express"
import dotenv from "dotenv"

import httpLogger from "./logger/httpLogger";

import connection from "./database/connection"

// import limiter from "./config/rateLimiter"
import client from "./integrations/redis"

import cookieParser from 'cookie-parser'



// import { globalCron, creatorReminderCron, guestReminderCron } from "./controllers/services/cron"

import indexRouter from "./routes/index"
import eventRouter from "./routes/events"
import userRouter from "./routes/user"


dotenv.config()

const app = express()
app.use(express.json())

// parse cookies
app.use(cookieParser())

// View engine setup
app.set('view engine', 'ejs');
app.set("views", "./src/views");
app.use(express.static('views'))



// Apply the rate limiting middleware to all requests globally
// app.use(limiter);

//redis
client.connect()

// for morgan
app.use(httpLogger);

//mongoose 
connection()

//cron jobs for notification of upcoming events
//adjusted for GMT+1
// schedule.scheduleJob("* * * * *", globalCron)
// schedule.scheduleJob("* * * * *", creatorReminderCron)
// schedule.scheduleJob("* * * * *", guestReminderCron)



app.use("/api/v1/events", eventRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1", indexRouter)




export default app