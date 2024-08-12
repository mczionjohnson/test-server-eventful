// import logger from "../logger/logger";
import dotenv from "dotenv";
import logger from "../logger/logger";

import { User } from "../models/userSchema";
import { Event } from "../models/eventSchema";
import { Ticket } from "../models/ticketSchema";

import { Producer } from '../worker/queue.process'
import { isToday } from "./services/dateToCronConverter";

import Jwt from "jsonwebtoken";

import nodemailer from "nodemailer"


dotenv.config();

export const memSignup = async (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const checkUser = await User.findOne({ email });
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

  const payload: { username: string, email: string, password: string } | any = {};

  if (username) {
    payload.username = username;
  }
  if (email) {
    payload.email = email;
  }
  if (password) {
    payload.password = password;
  }

  const user = new User({
    ...payload,
  });

  try {
    const savedUser = await user.save();

    // add job to the queue
    const data = {
      jobId: Math.random() * 10000,
      jobName: 'SendWelcomeEmail',
      email: user.email,
    }

    Producer(data); // creates data in queue
    console.log("job added to the queue")

    return res.json({
      message: "Success, You can now login",
      saved_user: [
        savedUser.username, savedUser.email, savedUser._id
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ message: error });

  }
};

export const memLogin = async (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");

  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return res.status(400).json({ message: "Enter email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Enter password" });
  }
  const user: any = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const checkPassword = await user.isValidPassword(password);

  if (checkPassword == false) {
    return res.status(401).json({ message: "Password is incorrect" });
  } else {
    const secret: any = process.env.JWT_SECRET;

    const token = Jwt.sign(
      {
        email: user.email,
        _id: user._id,
      },
      secret,
      { expiresIn: "1hr" }
    );

    // add job to the queue
    // const data = {
    //   jobId: Math.random() * 10000,
    //   jobName: 'SendLoginAlert',
    //   email: user.email,
    // }

    // Producer(data); // creates data in queue
    // console.log("job added to the queue")

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.MAIL_USERNAME,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
        expires: 3599
      },
    } as nodemailer.TransportOptions);

    let mailOptions = {
      from: "mczionjohnson@gmail.com",
      to: user.email,
      subject: "Login direct",
      html: "<p>direct mailing</p>"
    };

    //  send a mail
    console.log("over to transporter");
    try {
      await transporter.sendMail(mailOptions)
    } catch (err) {
      return console.log("[messenger] Error" + err);
    }
    console.log("perfect");

    //   logger.info(token);

    // a function to create token for user
    // returns a token with signature with payload and automatic headers
    res.cookie('jwt', token, { httpOnly: true });
    return res.json({ message: "logged in successfully, token in cookies, expires in an hour" });
  }
};

export const scanner = async (req: any, res: any) => {
  const link = req.params.id.split("&&")
  console.log("event id:", link[0])
  console.log("user id:", link[1])
  const eventId = link[0]
  const userId = link[1]

  try {
    //search for event
    const event = await Event.findOne({ _id: eventId })
    if (event == null) {
      return res.status(401).json({ status: "failed", message: "Unauthorized qrcode 1" });
    } else {
      try {
        //search for user
        console.log("found the event from scanner")
        const user = await User.findOne({ _id: userId })
        if (user == null) {
          return res.status(401).json({ status: "failed", message: "Unauthorized qrcode 2" });
        } else {
          //check the list of guest
          console.log("found the user from scanner")
          const founduser = event.guests.filter(val => val === userId)
          if (founduser.length < 1) {
            return res.status(401).json({ status: "failed", message: "Unauthorized qrcode 3" });
          } else {
            console.log("confirmed guest from scanner")

            //is event today
            if (isToday(event.eventDate) === false) {
              return res.status(401).json({ status: "failed", message: "Event is not today" });
            } else {
              console.log("event is today")
              try {
                //get ticket
                const ticketUpdate: any = await Ticket.findOne({
                  $and: [{ eventId: eventId }, { guest: userId }]
                })
                const ticketId = ticketUpdate._id

                let attended = user.eventAttended.map(val =>
                  val === ticketUpdate.id
                )
                if (attended.length > 0) {
                  console.log("user already scanned")
                  return res.status(200).json({ status: "success", message: `${user.username} is scanning again` });
                } else {
                  const updateUser = await User.findOneAndUpdate(
                    { _id: userId },
                    {
                      $push: { eventAttended: String(ticketId) },
                    }
                  )
                  console.log("user profile updated")
                  try {
                    const eventUpdate = await Event.findOneAndUpdate(
                      { _id: eventId },
                      { $inc: { attended: 1 } },
                      {
                        returnOriginal: false //return updated doc
                      }
                    );
                    console.log("attended updated")
                    try {
                      // add job to the queue
                      const data = {
                        jobId: Math.random() * 10000,
                        jobName: 'SendQRScannerEmail',
                        email: user.email,
                        title: event.title
                      }
                      Producer(data); // creates data in queue
                      console.log("job added to the queue")
                      return res.status(200).json({ status: "success", message: `${user.username} welcome to ${event.title}` });

                    } catch (error) {
                      console.log(error, { message: "user update failed" })
                      return res.status(500).json({ message: "internal error" });
                    }
                  } catch (error) {
                    console.log(error, { message: "event update failed" })
                    return res.status(500).json({ message: "internal error" });
                  }
                }
              } catch (error) {
                console.log(error, { message: "ticket not found" })
                return res.status(500).json({ message: "internal error" });
              }
            }
          }
        }
      }
      catch (error: any) {
        logger.error(error);
        return res.status(401).json({ message: "Unauthorized qrcode 2" });
      }
    }
  } catch (error: any) {
    logger.error(error);
    return res.json({ message: "Unsuccessful" });
  }
}


