"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestReminderCron = exports.creatorReminderCron = exports.globalCron = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const eventSchema_1 = require("../../models/eventSchema");
const ticketSchema_1 = require("../../models/ticketSchema");
const queue_process_1 = require("../../worker/queue.process");
const dateToCronConverter_1 = require("./dateToCronConverter");
//global
const globalCron = async () => {
    //gets the current date
    const date = new Date().toISOString().split("T")[0];
    //find events
    let events = await eventSchema_1.Event.find({
        eventDate: date
    });
    if (events.length >= 1) {
        console.log(`We have ${events.length} events today, Hurray!`);
        // call function on each
        for (let i = 0; i < events.length; i++) {
            events[i].guests.map(val => ticketSchema_1.Ticket.findOne({
                $and: [
                    { guest: val }, { eventId: events[i]._id }
                ]
            }).then((result) => {
                // add job to the queue
                (0, queue_process_1.Producer)({ jobId: Math.random() * 10000, jobName: "SendGlobalReminder", result: result }); // creates data in queue
                console.log("job added to the queue");
            }));
        }
        // allEvents(result, events[i].title, events[i].eventDate, events[i].eventTime, events[i].location
    }
    else {
        return console.log("well, well, well, no event today");
    }
};
exports.globalCron = globalCron;
const creatorReminderCron = async () => {
    //gets the current date
    const date = new Date();
    let now_cron = (0, dateToCronConverter_1.todayToCron)(date); //converts to user's timezone because cron was saved in user's timezone
    //check for reminder at this moment
    let events = await eventSchema_1.Event.find({
        reminder_cron: now_cron
    });
    if (events.length > 0) {
        console.log(`We have ${events.length} event reminder to send now, Hurray!`);
        // call function on each
        for (let i = 0; i < events.length; i++) {
            events[i].guests.map(val => ticketSchema_1.Ticket.findOne({
                $and: [
                    { guest: val }, { eventId: events[i]._id }
                ]
            }).then((result) => {
                // add job to the queue
                (0, queue_process_1.Producer)({ jobId: Math.random() * 10000, jobName: "SendCreatorReminder", result: result }); // creates data in queue
                console.log("job added to the queue");
            }));
        }
    }
    else {
        return console.log("well, well, well, no creator reminder at this minute");
    }
};
exports.creatorReminderCron = creatorReminderCron;
const guestReminderCron = async () => {
    //gets the current date
    const date = new Date();
    let now_cron = (0, dateToCronConverter_1.todayToCron)(date); //converts to user's timezone because cron was saved in user's timezone
    //check for reminder at this moment
    let ticket = await ticketSchema_1.Ticket.find({
        reminder_cron: now_cron
    });
    if (ticket.length >= 1) {
        console.log(`We have ${ticket.length} ticket reminder to send now, Hurray!`);
        // call function on each
        for (let i = 0; i < ticket.length; i++) {
            // add job to the queue
            (0, queue_process_1.Producer)({ jobId: Math.random() * 10000, jobName: "SendTicketReminder", ticket: ticket[i] }); // creates data in queue
            console.log("job added to the queue");
        }
    }
    else {
        return console.log("well, well, well, no guest reminder at this minute");
    }
};
exports.guestReminderCron = guestReminderCron;
