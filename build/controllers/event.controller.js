"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.patchEvent = exports.guestList = exports.getTicket = exports.shareOneEvent = exports.createEvent = exports.getOneEvent = exports.getAllEvents = void 0;
const userService = __importStar(require("./services/event.service"));
const logger_1 = __importDefault(require("../logger/logger"));
const eventSchema_1 = require("../models/eventSchema");
const userSchema_1 = require("../models/userSchema");
const ticketSchema_1 = require("../models/ticketSchema");
const queue_process_1 = require("../worker/queue.process");
const cloudinary_1 = require("../integrations/cloudinary");
const dateToCronConverter_1 = require("./services/dateToCronConverter");
const qrcode_1 = __importDefault(require("qrcode"));
const getAllEvents = async (req, res) => {
    try {
        let page = Number(req.query.page) || 1;
        page = page < 1 ? 1 : page;
        let limit = Number(req.query.limit) || 5;
        limit = limit < 1 ? 5 : limit;
        let query = req.query.q;
        const result = await userService.getAllEvents(page, limit, query);
        let data = result.data;
        let meta = result.meta;
        return res.status(200).json({ message: "Upcoming Events", data, meta });
    }
    catch (error) {
        return res.status(500).json({ message: error });
    }
};
exports.getAllEvents = getAllEvents;
const getOneEvent = async (req, res) => {
    const { eventId } = req.params;
    try {
        const singleEvent = await eventSchema_1.Event.findOne({
            _id: eventId,
        });
        if (singleEvent != null) {
            return res.status(200).json({ message: "viewing an event", Event: singleEvent });
        }
        else {
            return res.status(404).json({ message: "not found" });
        }
        ;
    }
    catch {
        return res.status(404).json({ message: "not found" });
        ;
    }
};
exports.getOneEvent = getOneEvent;
const createEvent = async (req, res) => {
    try {
        const { title, host, tags, description, location, ticketPrice, eventDate, eventTime, rsvp, reminder, //returned in UTC "2024-07-27T15:00:00.000Z"
         } = req.body;
        const loggedUser = req.body.user;
        const id = loggedUser._id;
        const check = await eventSchema_1.Event.findOne({
            $and: [{ title: title }, { eventTime: eventTime }, { eventDate: eventDate },
                { location: location }]
        });
        console.log("check complete");
        if (check == null) {
            const event = new eventSchema_1.Event({
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
                reminder_cron: (0, dateToCronConverter_1.dateToCron)(reminder) //converted to cron
            });
            const newEvent = await event.save();
            await userSchema_1.User.findOneAndUpdate({ _id: id }, {
                $push: { eventCreated: String(newEvent._id) }
            }, {
                returnOriginal: false //return updated doc
            });
            // add job to the queue
            const data = {
                jobId: Math.random() * 10000,
                jobName: 'SendEventCreationEmail',
                email: loggedUser.email, //  
            };
            (0, queue_process_1.Producer)(data); // creates data in queue
            console.log("job added to the queue");
            logger_1.default.info(`Success: ${loggedUser.email} created an event`);
            return res.status(200).json({
                message: "Event created",
                event: newEvent,
                Reminder: reminder,
            });
            ;
        }
        else {
            logger_1.default.info("unsuccessful, duplicate event");
            return res.status(500).json({ message: "unsuccessful, duplicate event" });
        }
    }
    catch (error) {
        logger_1.default.error(error);
        return res.json({ message: "Unsuccessful" });
    }
};
exports.createEvent = createEvent;
const shareOneEvent = async (req, res) => {
    const { eventId } = req.params;
    try {
        const singleEvent = await eventSchema_1.Event.findOne({
            _id: eventId,
        });
        if (singleEvent != null) {
            return res.status(200).json({
                message: "Share with friends",
                twitter: `https://x.com/intent/post?text=${singleEvent.title}+https%3A%2F%2Fexample.com%2Fevents%2F${eventId}`,
                facebook: `https://www.facebook.com/dialog/share?app_id=28218816837&display=popup&href=https%3A%2F%2Fexample.com%2Fevents%2F${eventId}`,
                whatsapp: `whatsapp://send?text=Check%20out%20this%20event:%20${singleEvent.title}%20link:https://example.com/events/${eventId}`
            });
        }
        else {
            return res.status(404).json({ message: "not found" });
        }
    }
    catch {
        return res.status(404).json({ message: "not found" });
    }
};
exports.shareOneEvent = shareOneEvent;
const getTicket = async (req, res) => {
    const { eventId } = req.params;
    const user = req.body.user;
    const id = user._id;
    try {
        //find event
        const singleEvent = await eventSchema_1.Event.findOne({
            _id: eventId,
        });
        if (singleEvent == null) {
            return res.status(404).json({ message: "event not found" });
            ;
        }
        else {
            if (singleEvent.user == user._id) {
                return res.status(404).json({ message: "You are the creator of this event" });
            }
            //event found now find user
            try {
                const check = await userSchema_1.User.findOne({
                    _id: id,
                });
                if (check != null) {
                    //user found
                    let duplicateTicket = singleEvent.guests.filter((val) => val === user._id);
                    if (duplicateTicket.length > 0) {
                        return res.status(422).json({ message: "duplicate ticket" });
                    }
                    else {
                        try {
                            const qrPath = `./public/${id}invitation.png`;
                            const qrText = `${eventId}&&${id}`;
                            // create qr
                            // reload if unsuccessful
                            await qrcode_1.default.toFile(qrPath, qrText, function (err) {
                                if (err)
                                    throw err;
                                console.log("QR code created");
                                // res.download(qrPath, "ticket.png"); // Set disposition and send it.
                            });
                            //payment provider to return success or failed
                            const payment = req.body.payment;
                            if (payment != "success") {
                                return res.status(402).json({ message: "Transaction failed, please make payment" });
                            }
                            if (payment == "success") {
                                try {
                                    //upload to cloudinary and returns data obj
                                    let cloud_data = await cloudinary_1.cloud.uploader.upload(qrPath, {
                                        use_asset_folder_as_public_id_prefix: true,
                                        folder: `eventful/${singleEvent.title}`,
                                        resource_type: "image",
                                        tags: [singleEvent.title, qrText, "ticket"]
                                    });
                                    const ticket = new ticketSchema_1.Ticket({
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
                                        reminder_cron: (0, dateToCronConverter_1.dateToCron)(req.body.reminder) // date converted to cron
                                    });
                                    try {
                                        const newTicket = await ticket.save();
                                        const ticketId = newTicket._id;
                                        try {
                                            const updateUser = await userSchema_1.User.findOneAndUpdate({ _id: id }, {
                                                $push: { eventTickets: String(ticketId) },
                                            });
                                            try {
                                                const eventUpdate = await eventSchema_1.Event.updateMany({ _id: eventId }, { $inc: { ticketSold: 1 }, $push: { guests: id } }, {
                                                    returnOriginal: false //return updated doc
                                                });
                                                // add job to the queue
                                                const data = {
                                                    jobId: Math.random() * 10000,
                                                    jobName: 'SendTicketPurchaseEmail',
                                                    email: user.email,
                                                    cloud: cloud_data.secure_url, // from cloudinary result obj
                                                    title: singleEvent.title,
                                                };
                                                (0, queue_process_1.Producer)(data); // creates data in queue
                                                console.log("job added to the queue");
                                                return res.status(200).json({ message: "Ticket bought, check your mail for the qr code", ticket: newTicket._id, QR_code: cloud_data.secure_url });
                                            }
                                            catch (error) {
                                                console.log(error);
                                                return res.status(500).json({ message: "internal error" });
                                            }
                                        }
                                        catch (error) {
                                            console.log(error);
                                            return res.status(500).json({ message: "internal error" });
                                        }
                                    }
                                    catch (error) {
                                        console.log(error);
                                        return res.status(500).json({ message: "internal error" });
                                    }
                                }
                                catch (error) {
                                    console.log(error);
                                    return res.status(500).json({ message: "internal error, please try again after some minutes" });
                                }
                            }
                            else {
                                return res.status(402).json({ message: "Transaction failed, please try again" });
                                ;
                            }
                        }
                        catch (error) {
                            console.log(error);
                            return res.status(500).json({ message: "internal error, please retry" });
                        }
                    }
                }
                else {
                    return res.status(401).json({ message: "Unauthorized" });
                    ;
                }
            }
            catch (error) {
                console.log(error);
                return res.status(404).json({ message: "user not found" });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "not found" });
    }
};
exports.getTicket = getTicket;
const guestList = async (req, res) => {
    const { eventId } = req.params;
    const user = req.body.user; //from checkAuth
    const id = user._id;
    try {
        //find event by id and creator's id
        const singleEvent = await eventSchema_1.Event.findOne({
            _id: eventId
        });
        if (singleEvent == null) {
            return res.status(404).json({ message: "event not found" });
            ;
        }
        else {
            let guestEmail = [];
            //event found now confirm creator
            if (singleEvent.user == user._id) {
                if (singleEvent.guests.length > 0) {
                    console.log(`found ${singleEvent.guests.length} Guest(s)`);
                    let iterator = singleEvent.guests.values();
                    for (let elements of iterator) {
                        // console.log(elements)
                        const eachUser = await userSchema_1.User.findOne({ _id: elements });
                        // console.log(eachUser)
                        guestEmail.push(eachUser.email);
                    }
                    try {
                        return res.status(200).json({ message: `you have ${guestEmail.length} Guest(s)`, Guest: guestEmail }); //returns guest emails
                    }
                    catch (error) {
                        console.log(error, { message: "guest list array not working" });
                        return res.status(500).json({ message: "internal error" });
                    }
                }
                else {
                    console.log("empty Guest list");
                    return res.status(200).json({ message: "No Guest found", Guests: singleEvent.guests.length });
                }
            }
            else {
                return res.status(401).json({ message: "Unauthorized, You are not the creator of this event" });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "not found" });
        ;
    }
};
exports.guestList = guestList;
const patchEvent = async (req, res) => {
    const { eventId } = req.params;
    const user = req.body.user;
    const id = user._id;
    const { title, host, tags, description, location, ticketPrice, eventDate, eventTime, rsvp, reminder, //returned in UTC "2024-07-27T15:00:00.000Z"
     } = req.body;
    try {
        const event = await eventSchema_1.Event.findOne({
            $and: [{ _id: eventId }, { user: id }]
        });
        if (event != null) {
            let payload = {};
            if (title) {
                payload.title = title;
            }
            if (host) {
                payload.host = host;
            }
            if (tags) {
                payload.tags = tags;
            }
            if (description) {
                payload.description = description;
            }
            if (location) {
                payload.location = location;
            }
            if (ticketPrice) {
                payload.ticketPrice = ticketPrice;
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
                payload.reminder = reminder;
                payload.reminder_cron = (0, dateToCronConverter_1.dateToCron)(reminder); //converted to cron  
            }
            const isObjectEmpty = (objectName) => {
                return (objectName &&
                    Object.keys(objectName).length === 0 &&
                    objectName.constructor === Object);
            };
            if (isObjectEmpty(payload) != true) {
                console.log("payload:", payload);
                const updatedEvent = await eventSchema_1.Event.findOneAndUpdate({ _id: eventId }, payload, {
                    new: true,
                });
                // add job to the queue
                const data = {
                    jobId: Math.random() * 10000,
                    jobName: 'SendEventUpdateEmail',
                    email: user.email,
                    title: event.title,
                };
                (0, queue_process_1.Producer)(data); // creates data in queue
                console.log("job added to the queue");
                return res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
            }
            else {
                console.log("payload:", payload);
                return res.status(404).json({ message: "not update found" });
            }
        }
        else {
            return res.status(401).json({ status: "failed", message: "Unauthorized" });
        }
    }
    catch (error) {
        logger_1.default.error(error.message);
        return res.json({ message: "Unsuccessful" });
    }
};
exports.patchEvent = patchEvent;
const deleteEvent = async (req, res) => {
    const { eventId } = req.params;
    const user = req.body.user;
    const id = user._id;
    try {
        const event = await eventSchema_1.Event.findOne({
            $and: [{ _id: eventId }, { user: id }]
        });
        if (event != null) {
            try {
                await userSchema_1.User.findOneAndUpdate({ _id: id }, {
                    $pull: { eventCreated: eventId }
                }, {
                    returnOriginal: false //return updated doc
                });
                try {
                    const deleted = await eventSchema_1.Event.deleteOne({
                        $and: [{ _id: eventId }, { user: id }]
                    });
                    // add job to the queue
                    const data = {
                        jobId: Math.random() * 10000,
                        jobName: 'SendEventDeleteEmail',
                        email: user.email,
                        title: event.title,
                    };
                    (0, queue_process_1.Producer)(data); // creates data in queue
                    console.log("job added to the queue");
                    return res.status(200).json({ message: "Event deleted successfully", deleted });
                }
                catch (error) {
                    logger_1.default.error(error);
                    return res.status(500).json({ message: "Unsuccessful" });
                }
            }
            catch (error) {
                logger_1.default.error(error);
                return res.status(500).json({ message: "Unsuccessful" });
            }
        }
        else {
            return res.status(404).json({ message: "Event not found" });
        }
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "unsuccessful" });
    }
};
exports.deleteEvent = deleteEvent;
