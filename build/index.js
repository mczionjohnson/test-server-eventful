"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const httpLogger_1 = __importDefault(require("./logger/httpLogger"));
const connection_1 = __importDefault(require("./database/connection"));
// import limiter from "./config/rateLimiter"
const redis_1 = __importDefault(require("./integrations/redis"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import { globalCron, creatorReminderCron, guestReminderCron } from "./controllers/services/cron"
const index_1 = __importDefault(require("./routes/index"));
const events_1 = __importDefault(require("./routes/events"));
const user_1 = __importDefault(require("./routes/user"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// parse cookies
app.use((0, cookie_parser_1.default)());
// View engine setup
app.set('view engine', 'ejs');
app.set("views", "./src/views");
app.use(express_1.default.static('views'));
// Apply the rate limiting middleware to all requests globally
// app.use(limiter);
//redis
redis_1.default.connect();
// for morgan
app.use(httpLogger_1.default);
//mongoose 
(0, connection_1.default)();
//cron jobs for notification of upcoming events
//adjusted for GMT+1
// schedule.scheduleJob("* * * * *", globalCron)
// schedule.scheduleJob("* * * * *", creatorReminderCron)
// schedule.scheduleJob("* * * * *", guestReminderCron)
app.use("/api/v1/events", events_1.default);
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/", index_1.default);
exports.default = app;
