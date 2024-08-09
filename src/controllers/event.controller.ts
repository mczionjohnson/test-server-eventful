import { Request, Response } from 'express';

import * as userService from "./services/event.service";
import logger from "../logger/logger";

import { Event } from "../models/eventSchema";
import { User } from "../models/userSchema";
import { Ticket } from "../models/ticketSchema";

import { Producer } from '../worker/queue.process'

import { cloud } from "../integrations/cloudinary"

import { dateToCron } from "./services/dateToCronConverter"


import QRCode from "qrcode";


export const getAllEvents = async (req: Request, res: Response) => {
  try {
    let page: number = Number(req.query.page) || 1;
    page = page < 1 ? 1 : page;
    let limit: number = Number(req.query.limit) || 5;
    limit = limit < 1 ? 5 : limit;
    let query: any = req.query.q;

    const result = await userService.getAllEvents(page, limit, query);
    let data = result.data
    let meta = result.meta


    return res.status(200).json({ message: "Upcoming Events", data, meta });


  } catch (error: any) {
    return res.status(500).json({ message: error });

  }
};

export const getOneEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const singleEvent = await Event.findOne({
      _id: eventId,
    });

    if (singleEvent != null) {
      return res.status(200).json({ message: "viewing an event", Event: singleEvent });
    } else {
      return res.status(404).json({ message: "not found" });
    }

    ;
  } catch {
    return res.status(404).json({ message: "not found" });
    ;
  }

}

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      host,
      tags,
      description,
      location,
      ticketPrice,
      eventDate,
      eventTime,
      rsvp,
      reminder, //returned in UTC "2024-07-27T15:00:00.000Z"
    } = req.body;
    const loggedUser = req.body.user;
    const id: string = loggedUser._id;

    const check: [] | null = await Event.findOne({
      $and: [{ title: title }, { eventTime: eventTime }, { eventDate: eventDate },
      { location: location }]
    });

    console.log("check complete")

    if (check == null) {
      const event = new Event({
        title: title,
        host: host,
        tags: tags,
        user: id,
        description: description,
        location: location,
        ticketPrice: ticketPrice,
        eventDate: eventDate,
        eventTime: eventTime,
        rsvp: rsvp,
        reminder: reminder,
        reminder_cron: dateToCron(reminder) //converted to cron
      });

      const newEvent = await event.save();

      await User.findOneAndUpdate(
        { _id: id },
        {
          $push: { eventCreated: String(newEvent._id) }
        },
        {
          returnOriginal: false //return updated doc
        }
      )

      // add job to the queue
      const data = {
        jobId: Math.random() * 10000,
        jobName: 'SendEventCreationEmail',
        email: loggedUser.email, //  
      }

      Producer(data); // creates data in queue
      console.log("job added to the queue")


      logger.info(`Success: ${loggedUser.email} created an event`);
      return res.status(200).json({
        message: "Event created",
        event: newEvent,
        Reminder: reminder,
      });
      ;
    } else {
      logger.info("unsuccessful, duplicate event");
      return res.status(500).json({ message: "unsuccessful, duplicate event" });
    }
  } catch (error: any) {
    logger.error(error);
    return res.json({ message: "Unsuccessful" });
  }
};

export const shareOneEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const singleEvent = await Event.findOne({
      _id: eventId,
    });
    if (singleEvent != null) {
      return res.status(200).json({
        message: "Share with friends",
        twitter: `https://x.com/intent/post?text=${singleEvent.title}+https%3A%2F%2Fexample.com%2Fevents%2F${eventId}`,
        facebook: `https://www.facebook.com/dialog/share?app_id=28218816837&display=popup&href=https%3A%2F%2Fexample.com%2Fevents%2F${eventId}`,
        whatsapp: `whatsapp://send?text=Check%20out%20this%20event:%20${singleEvent.title}%20link:https://example.com/events/${eventId}`
      });
    } else {
      return res.status(404).json({ message: "not found" });

    }

  } catch {
    return res.status(404).json({ message: "not found" });
  }

}

export const getTicket = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const user = req.body.user;
  const id: string = user._id;

  try {
    //find event
    const singleEvent = await Event.findOne({
      _id: eventId,
    })
    if (singleEvent == null) {
      return res.status(404).json({ message: "event not found" });
      ;
    } else {
      if (singleEvent.user == user._id) {
        return res.status(404).json({ message: "You are the creator of this event" });
      }
      //event found now find user

      try {
        const check = await User.findOne({
          _id: id,
        })
        if (check != null) {
          //user found
          let duplicateTicket = singleEvent.guests.filter((val) =>
            val === user._id
          )
          if (duplicateTicket.length > 0) {
            return res.status(422).json({ message: "duplicate ticket" });
          } else {
            try {
              const qrPath = `./public/${id}invitation.png`
              const qrText = `${eventId}&&${id}`

              // create qr
              // reload if unsuccessful
              await QRCode.toFile(qrPath, qrText, function (err) {
                if (err) throw err;
                console.log("QR code created");
                // res.download(qrPath, "ticket.png"); // Set disposition and send it.
              });

              //payment provider to return success or failed
              const payment = req.body.payment
              if (payment != "success") {
                return res.status(402).json({ message: "Transaction failed, please make payment" });

              } if (payment == "success") {
                try {

                  //upload to cloudinary and returns data obj
                  let cloud_data: any = await cloud.uploader.upload(qrPath, {
                    use_asset_folder_as_public_id_prefix: true,
                    folder: `eventful/${singleEvent.title}`,
                    resource_type: "image",
                    tags: [singleEvent.title, qrText, "ticket"]
                  })

                  const ticket = new Ticket({
                    title: singleEvent.title,
                    eventId: singleEvent._id,
                    user: singleEvent.user,
                    location: singleEvent.location,
                    ticketPrice: singleEvent.ticketPrice,
                    ticketStyle: singleEvent.ticketStyle,
                    eventDate: singleEvent.eventDate,
                    eventTime: singleEvent.eventTime,
                    guest: id,
                    guest_email: check.email,
                    cloud: cloud_data.secure_url,
                    reminder: req.body.reminder,
                    reminder_cron: dateToCron(req.body.reminder) // date converted to cron
                  });
                  try {
                    const newTicket = await ticket.save();
                    const ticketId = newTicket._id

                    try {
                      const updateUser = await User.findOneAndUpdate(
                        { _id: id },
                        {
                          $push: { eventTickets: String(ticketId) },
                        }
                      )
                      try {
                        const eventUpdate = await Event.updateMany(
                          { _id: eventId },
                          { $inc: { ticketSold: 1 }, $push: { guests: id } },
                          {
                            returnOriginal: false //return updated doc
                          }
                        );

                        // add job to the queue
                        const data = {
                          jobId: Math.random() * 10000,
                          jobName: 'SendTicketPurchaseEmail',
                          email: user.email,
                          cloud: cloud_data.secure_url, // from cloudinary result obj
                          title: singleEvent.title,
                        }
                        Producer(data); // creates data in queue
                        console.log("job added to the queue")

                        return res.status(200).json({ message: "Ticket bought, check your mail for the qr code", ticket: newTicket._id, QR_code: cloud_data.secure_url });
                      } catch (error) {
                        console.log(error)
                        return res.status(500).json({ message: "internal error" });
                      }
                    } catch (error) {
                      console.log(error)
                      return res.status(500).json({ message: "internal error" });
                    }
                  } catch (error) {
                    console.log(error)
                    return res.status(500).json({ message: "internal error" });
                  }
                } catch (error) {
                  console.log(error)
                  return res.status(500).json({ message: "internal error, please try again after some minutes" });
                }
              } else {
                return res.status(402).json({ message: "Transaction failed, please try again" });
                ;
              }
            } catch (error) {
              console.log(error)
              return res.status(500).json({ message: "internal error, please retry" });
            }
          }
        } else {
          return res.status(401).json({ message: "Unauthorized" });
          ;
        }
      } catch (error) {
        console.log(error)
        return res.status(404).json({ message: "user not found" });
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(404).json({ message: "not found" });
  }
}

export const guestList = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const user = req.body.user; //from checkAuth
  const id: string = user._id;

  try {
    //find event by id and creator's id
    const singleEvent = await Event.findOne({
      _id: eventId
    })
    if (singleEvent == null) {
      return res.status(404).json({ message: "event not found" });
      ;
    } else {
      let guestEmail: (string | null)[] = []

      //event found now confirm creator
      if (singleEvent.user == user._id) {
        if (singleEvent.guests.length > 0) {
          console.log(`found ${singleEvent.guests.length} Guest(s)`)
          let iterator = singleEvent.guests.values();

          for (let elements of iterator) {
            // console.log(elements)

            const eachUser: any = await User.findOne({ _id: elements })
            // console.log(eachUser)
            guestEmail.push(eachUser.email);
          }
          try {
            return res.status(200).json({ message: `you have ${guestEmail.length} Guest(s)`, Guest: guestEmail });//returns guest emails
          } catch (error) {
            console.log(error, { message: "guest list array not working" })
            return res.status(500).json({ message: "internal error" });
          }
        } else {
          console.log("empty Guest list")
          return res.status(200).json({ message: "No Guest found", Guests: singleEvent.guests.length });
        }
      } else {
        return res.status(401).json({ message: "Unauthorized, You are not the creator of this event" });
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(404).json({ message: "not found" });
    ;
  }
}

export const patchEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const user = req.body.user;
  const id: string = user._id;

  const {
    location,
    eventDate,
    eventTime,
    rsvp,
    reminder, //returned in UTC "2024-07-27T15:00:00.000Z"
  } = req.body;

  try {
    const event = await Event.findOne({
      $and: [{ _id: eventId }, { user: id }]
    })

    if (event != null) {

      type Org = { [key: string]: string }
      let payload: Org = {}

      if (location) {
        payload.location = location;
      }
      if (eventDate) {
        payload.eventDate = eventDate;
      }
      if (eventTime) {
        payload.eventTime = eventTime;
      }
      if (rsvp) {
        payload.rsvp = rsvp;
      }
      if (reminder) {
        payload.reminder = reminder
        payload.reminder_cron = dateToCron(reminder);//converted to cron  
      }

      const isObjectEmpty = (objectName: {}) => {
        return (
          objectName &&
          Object.keys(objectName).length === 0 &&
          objectName.constructor === Object
        );
      };

      if (isObjectEmpty(payload) != true) {
        console.log("payload:", payload)

        const updatedEvent = await Event.findOneAndUpdate(
          { _id: eventId },
          payload,
          {
            new: true,
          }
        );

        // add job to the queue
        const data = {
          jobId: Math.random() * 10000,
          jobName: 'SendEventUpdateEmail',
          email: user.email,
          title: event.title,
        }
        Producer(data); // creates data in queue
        console.log("job added to the queue")

        return res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
      } else {
        console.log("payload:", payload)
        return res.status(404).json({ message: "not update found" });
      }
    } else {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

  } catch (error: any) {
    logger.error(error.message);
    return res.json({ message: "Unsuccessful" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const user = req.body.user;
  const id: string = user._id;

  try {
    const event = await Event.findOne({
      $and: [{ _id: eventId }, { user: id }]
    })
    if (event != null) {
      try {
        await User.findOneAndUpdate(
          { _id: id },
          {
            $pull: { eventCreated: eventId }
          },
          {
            returnOriginal: false //return updated doc
          }
        )

        try {
          const deleted = await Event.deleteOne({
            $and: [{ _id: eventId }, { user: id }]
          });

          // add job to the queue
          const data = {
            jobId: Math.random() * 10000,
            jobName: 'SendEventDeleteEmail',
            email: user.email,
            title: event.title,
          }
          Producer(data); // creates data in queue
          console.log("job added to the queue")

          return res.status(200).json({ message: "Event deleted successfully", deleted });
        } catch (error: any) {
          logger.error(error);
          return res.status(500).json({ message: "Unsuccessful" });
        }
      } catch (error: any) {
        logger.error(error);
        return res.status(500).json({ message: "Unsuccessful" });
      }
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "unsuccessful" });
  }

};