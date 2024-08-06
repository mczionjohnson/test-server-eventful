import logger from "../logger/logger";
import { Request, Response } from "express";

import { User } from "../models/userSchema";
import { Ticket } from "../models/ticketSchema";
import { dateToCron } from "./services/dateToCronConverter"

import { Producer } from '../worker/queue.process'

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = req.body.user;
        const id: string = user._id;

        // returns profile excluding password
        const userProfile: any = await User.findOne({ _id: id }).select("-password -_id -__v")

        if (userProfile != null) {
            return res.status(200).json({
                message: "Your Profile", userProfile
            });

        } else {
            return res.status(500).json({ message: "internal error" });
        }



    } catch (error: any) {
        return res.status(500).json({ message: error.message });

    }
}

export const getEventAttended = async (req: Request, res: Response) => {
    try {
        const user = req.body.user;
        const id: string = user._id;

        // returns profile excluding password etc
        const newArray: any = await User.findOne({ _id: id }).select("-password -_id -__v")

        if (newArray != null) {
            const total = newArray.eventAttended.length
            const eventAttended = newArray.eventAttended
            return res.status(200).json({ message: "Event(s) Attended", total, eventAttended });

        } else {
            return res.status(500).json({ message: "internal error" });
        }


    } catch (error: any) {
        return res.status(500).json({ message: error.message });

    }
}

export const getUserTickets = async (req: Request, res: Response) => {
    try {
        const user = req.body.user;
        const id: string = user._id;

        // returns profile excluding password etc
        const newArray: any = await User.findOne({ _id: id }).select("-password -_id -__v")


        if (newArray != null) {
            const total = newArray.eventTickets.length
            const eventTickets = newArray.eventTickets
            return res.status(200).json({ message: "All Tickets", total, eventTickets });

        } else {
            return res.status(500).json({ message: "internal error" });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });

    }
}

export const viewOneTicket = async (req: Request, res: Response) => {
    try {
        const eventId = req.params.id
        const user = req.body.user;
        const id: string = user._id;

        const ticketInfo: any = await Ticket.findOne({
            $and: [
                { guest: id }, { _id: eventId }
            ]
        }).select("-__v -eventId -guest -updatedAt -user")

        if (ticketInfo != null) {

            return res.status(200).json({
                message: "Event Ticket", ticketInfo
            });


        } else {
            return res.status(500).json({ message: "internal error" });
        }

    } catch (error: any) {
        return res.status(500).json({ message: error.message });

    }
}

export const editOneTicket = async (req: Request, res: Response) => {
    try {
        const ticketId = req.params.id
        const user = req.body.user;
        const id: string = user._id;
        const reminder = req.body.reminder

        if (reminder != null) {
            try {
                const ticketFound = await Ticket.findOne({
                    $and: [{ _id: ticketId }, { guest: id }]
                })
                if (ticketFound) {
                    try {
                        const updatedTicket = await Ticket.findOneAndUpdate(
                            {
                                $and: [
                                    { guest: id }, { _id: ticketId }
                                ]
                            },
                            { reminder_cron: dateToCron(reminder), reminder: reminder },
                            {
                                new: true,
                            }
                        );
                        // add job to the queue
                        const data = {
                            jobId: Math.random() * 10000,
                            jobName: 'SendTicketUpdateEmail',
                            email: user.email,
                            title: ticketFound.title,
                        }
                        Producer(data); // creates data in queue
                        console.log("job added to the queue")

                        return res.status(200).json({ message: "Event Ticket", updatedTicket });
                    } catch (error: any) {
                        return res.status(500).json({ message: error.message });
                    }
                } else {
                    return res.status(500).json({ message: "Internal error" });
                }
            } catch (error: any) {
                logger.error(error.message);
                return res.json({ message: "Unsuccessful" });
            }
        } else {
            return res.status(422).json({ message: "Ticket not found" });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

export const getUserEvents = async (req: Request, res: Response) => {
    try {
        const user = req.body.user;
        const id: string = user._id;

        const newArray: any = await User.findOne({ _id: id }).select("-password -_id -__v")

        if (newArray != null) {
            const total = newArray.eventCreated.length
            const events = newArray.eventCreated

            return res.status(200).json({ message: "All Event(s) created by you", total, events });//return event_id
        } else {
            return res.status(500).json({ message: "internal error" });
        }

    } catch (error: any) {
        return res.status(500).json({ message: error.message });

    }
}

