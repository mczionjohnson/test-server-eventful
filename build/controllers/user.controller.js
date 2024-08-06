"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEvents = exports.editOneTicket = exports.viewOneTicket = exports.getUserTickets = exports.getEventAttended = exports.getUserProfile = void 0;
const logger_1 = __importDefault(require("../logger/logger"));
const userSchema_1 = require("../models/userSchema");
const ticketSchema_1 = require("../models/ticketSchema");
const dateToCronConverter_1 = require("./services/dateToCronConverter");
const queue_process_1 = require("../worker/queue.process");
const getUserProfile = async (req, res) => {
    try {
        const user = req.body.user;
        const id = user._id;
        // returns profile excluding password
        const userProfile = await userSchema_1.User.findOne({ _id: id }).select("-password -_id -__v");
        if (userProfile != null) {
            return res.status(200).json({
                message: "Your Profile", userProfile
            });
        }
        else {
            return res.status(500).json({ message: "internal error" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getUserProfile = getUserProfile;
const getEventAttended = async (req, res) => {
    try {
        const user = req.body.user;
        const id = user._id;
        // returns profile excluding password etc
        const newArray = await userSchema_1.User.findOne({ _id: id }).select("-password -_id -__v");
        if (newArray != null) {
            const total = newArray.eventAttended.length;
            const eventAttended = newArray.eventAttended;
            return res.status(200).json({ message: "Event(s) Attended", total, eventAttended });
        }
        else {
            return res.status(500).json({ message: "internal error" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getEventAttended = getEventAttended;
const getUserTickets = async (req, res) => {
    try {
        const user = req.body.user;
        const id = user._id;
        // returns profile excluding password etc
        const newArray = await userSchema_1.User.findOne({ _id: id }).select("-password -_id -__v");
        if (newArray != null) {
            const total = newArray.eventTickets.length;
            const eventTickets = newArray.eventTickets;
            return res.status(200).json({ message: "All Tickets", total, eventTickets });
        }
        else {
            return res.status(500).json({ message: "internal error" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getUserTickets = getUserTickets;
const viewOneTicket = async (req, res) => {
    try {
        const eventId = req.params.id;
        const user = req.body.user;
        const id = user._id;
        const ticketInfo = await ticketSchema_1.Ticket.findOne({
            $and: [
                { guest: id }, { _id: eventId }
            ]
        }).select("-__v -eventId -guest -updatedAt -user");
        if (ticketInfo != null) {
            return res.status(200).json({
                message: "Event Ticket", ticketInfo
            });
        }
        else {
            return res.status(500).json({ message: "internal error" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.viewOneTicket = viewOneTicket;
const editOneTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const user = req.body.user;
        const id = user._id;
        const reminder = req.body.reminder;
        if (reminder != null) {
            try {
                const ticketFound = await ticketSchema_1.Ticket.findOne({
                    $and: [{ _id: ticketId }, { guest: id }]
                });
                if (ticketFound) {
                    try {
                        const updatedTicket = await ticketSchema_1.Ticket.findOneAndUpdate({
                            $and: [
                                { guest: id }, { _id: ticketId }
                            ]
                        }, { reminder_cron: (0, dateToCronConverter_1.dateToCron)(reminder), reminder: reminder }, {
                            new: true,
                        });
                        // add job to the queue
                        const data = {
                            jobId: Math.random() * 10000,
                            jobName: 'SendTicketUpdateEmail',
                            email: user.email,
                            title: ticketFound.title,
                        };
                        (0, queue_process_1.Producer)(data); // creates data in queue
                        console.log("job added to the queue");
                        return res.status(200).json({ message: "Event Ticket", updatedTicket });
                    }
                    catch (error) {
                        return res.status(500).json({ message: error.message });
                    }
                }
                else {
                    return res.status(500).json({ message: "Internal error" });
                }
            }
            catch (error) {
                logger_1.default.error(error.message);
                return res.json({ message: "Unsuccessful" });
            }
        }
        else {
            return res.status(422).json({ message: "Ticket not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.editOneTicket = editOneTicket;
const getUserEvents = async (req, res) => {
    try {
        const user = req.body.user;
        const id = user._id;
        const newArray = await userSchema_1.User.findOne({ _id: id }).select("-password -_id -__v");
        if (newArray != null) {
            const total = newArray.eventCreated.length;
            const events = newArray.eventCreated;
            return res.status(200).json({ message: "All Event(s) created by you", total, events }); //return event_id
        }
        else {
            return res.status(500).json({ message: "internal error" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getUserEvents = getUserEvents;
