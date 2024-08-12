"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanner = exports.memLogin = exports.memSignup = void 0;
// import logger from "../logger/logger";
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../logger/logger"));
const userSchema_1 = require("../models/userSchema");
const eventSchema_1 = require("../models/eventSchema");
const ticketSchema_1 = require("../models/ticketSchema");
const queue_process_1 = require("../worker/queue.process");
const dateToCronConverter_1 = require("./services/dateToCronConverter");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const memSignup = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const checkUser = await userSchema_1.User.findOne({ email });
    if (checkUser) {
        return res.status(400).json("User already exists");
    }
    if (!username) {
        return res.status(400).json({ message: "Enter username" });
    }
    if (!email) {
        return res.status(400).json({ message: "Enter email" });
    }
    if (!password) {
        return res.status(400).json({ message: "Enter password" });
    }
    const payload = {};
    if (username) {
        payload.username = username;
    }
    if (email) {
        payload.email = email;
    }
    if (password) {
        payload.password = password;
    }
    const user = new userSchema_1.User({
        ...payload,
    });
    try {
        const savedUser = await user.save();
        // add job to the queue
        const data = {
            jobId: Math.random() * 10000,
            jobName: 'SendWelcomeEmail',
            email: user.email,
        };
        (0, queue_process_1.Producer)(data); // creates data in queue
        console.log("job added to the queue");
        return res.json({
            message: "Success, You can now login",
            saved_user: [
                savedUser.username, savedUser.email, savedUser._id
            ]
        });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
};
exports.memSignup = memSignup;
const memLogin = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const email = req.body.email;
    const password = req.body.password;
    if (!email) {
        return res.status(400).json({ message: "Enter email" });
    }
    if (!password) {
        return res.status(400).json({ message: "Enter password" });
    }
    const user = await userSchema_1.User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const checkPassword = await user.isValidPassword(password);
    if (checkPassword == false) {
        return res.status(401).json({ message: "Password is incorrect" });
    }
    else {
        const secret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({
            email: user.email,
            _id: user._id,
        }, secret, { expiresIn: "1hr" });
        // add job to the queue
        // const data = {
        //   jobId: Math.random() * 10000,
        //   jobName: 'SendLoginAlert',
        //   email: user.email,
        // }
        // Producer(data); // creates data in queue
        // console.log("job added to the queue")
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: process.env.MAIL_USERNAME,
                clientId: process.env.OAUTH_CLIENTID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: process.env.ACCESS_TOKEN
            },
        });
        let mailOptions = {
            from: "mczionjohnson@gmail.com",
            to: user.email,
            subject: "Login direct",
            html: "<p>direct mailing</p>"
        };
        //  send a mail
        console.log("over to transporter");
        try {
            await transporter.sendMail(mailOptions);
            console.log("perfect");
            res.cookie('jwt', token, { httpOnly: true });
            return res.json({ message: "logged in successfully, token in cookies, expires in an hour" });
        }
        catch (err) {
            return console.log("[messenger] Error" + err);
        }
        // a function to create token for user
        // returns a token with signature with payload and automatic headers
    }
};
exports.memLogin = memLogin;
const scanner = async (req, res) => {
    const link = req.params.id.split("&&");
    console.log("event id:", link[0]);
    console.log("user id:", link[1]);
    const eventId = link[0];
    const userId = link[1];
    try {
        //search for event
        const event = await eventSchema_1.Event.findOne({ _id: eventId });
        if (event == null) {
            return res.status(401).json({ status: "failed", message: "Unauthorized qrcode 1" });
        }
        else {
            try {
                //search for user
                console.log("found the event from scanner");
                const user = await userSchema_1.User.findOne({ _id: userId });
                if (user == null) {
                    return res.status(401).json({ status: "failed", message: "Unauthorized qrcode 2" });
                }
                else {
                    //check the list of guest
                    console.log("found the user from scanner");
                    const founduser = event.guests.filter(val => val === userId);
                    if (founduser.length < 1) {
                        return res.status(401).json({ status: "failed", message: "Unauthorized qrcode 3" });
                    }
                    else {
                        console.log("confirmed guest from scanner");
                        //is event today
                        if ((0, dateToCronConverter_1.isToday)(event.eventDate) === false) {
                            return res.status(401).json({ status: "failed", message: "Event is not today" });
                        }
                        else {
                            console.log("event is today");
                            try {
                                //get ticket
                                const ticketUpdate = await ticketSchema_1.Ticket.findOne({
                                    $and: [{ eventId: eventId }, { guest: userId }]
                                });
                                const ticketId = ticketUpdate._id;
                                let attended = user.eventAttended.map(val => val === ticketUpdate.id);
                                if (attended.length > 0) {
                                    console.log("user already scanned");
                                    return res.status(200).json({ status: "success", message: `${user.username} is scanning again` });
                                }
                                else {
                                    const updateUser = await userSchema_1.User.findOneAndUpdate({ _id: userId }, {
                                        $push: { eventAttended: String(ticketId) },
                                    });
                                    console.log("user profile updated");
                                    try {
                                        const eventUpdate = await eventSchema_1.Event.findOneAndUpdate({ _id: eventId }, { $inc: { attended: 1 } }, {
                                            returnOriginal: false //return updated doc
                                        });
                                        console.log("attended updated");
                                        try {
                                            // add job to the queue
                                            const data = {
                                                jobId: Math.random() * 10000,
                                                jobName: 'SendQRScannerEmail',
                                                email: user.email,
                                                title: event.title
                                            };
                                            (0, queue_process_1.Producer)(data); // creates data in queue
                                            console.log("job added to the queue");
                                            return res.status(200).json({ status: "success", message: `${user.username} welcome to ${event.title}` });
                                        }
                                        catch (error) {
                                            console.log(error, { message: "user update failed" });
                                            return res.status(500).json({ message: "internal error" });
                                        }
                                    }
                                    catch (error) {
                                        console.log(error, { message: "event update failed" });
                                        return res.status(500).json({ message: "internal error" });
                                    }
                                }
                            }
                            catch (error) {
                                console.log(error, { message: "ticket not found" });
                                return res.status(500).json({ message: "internal error" });
                            }
                        }
                    }
                }
            }
            catch (error) {
                logger_1.default.error(error);
                return res.status(401).json({ message: "Unauthorized qrcode 2" });
            }
        }
    }
    catch (error) {
        logger_1.default.error(error);
        return res.json({ message: "Unsuccessful" });
    }
};
exports.scanner = scanner;
