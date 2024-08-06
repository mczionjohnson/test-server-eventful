import dotenv from "dotenv";

dotenv.config();

import { Event } from "../../models/eventSchema";
import { Ticket } from "../../models/ticketSchema";

import { Producer } from '../../worker/queue.process'
import { todayToCron } from "./dateToCronConverter"




//global
export const globalCron = async () => {

  //gets the current date
  const date = new Date().toISOString().split("T")[0];

  //find events
  let events = await Event.find({
    eventDate: date
  });

  if (events.length >= 1) {

    console.log(`We have ${events.length} events today, Hurray!`);
    // call function on each
    for (let i = 0; i < events.length; i++) {
      events[i].guests.map(val =>
        Ticket.findOne({
          $and: [
            { guest: val }, { eventId: events[i]._id }
          ]
        }).then((result) => {
          // add job to the queue
          Producer({ jobId: Math.random() * 10000, jobName: "SendGlobalReminder", result: result }) // creates data in queue
          console.log("job added to the queue")
        })
      )
    }

    // allEvents(result, events[i].title, events[i].eventDate, events[i].eventTime, events[i].location
  } else {
    return console.log("well, well, well, no event today");
  }
};

export const creatorReminderCron = async () => {

  //gets the current date
  const date = new Date()

  let now_cron = todayToCron(date)//converts to user's timezone because cron was saved in user's timezone

  //check for reminder at this moment
  let events = await Event.find({
    reminder_cron: now_cron
  });

  if (events.length > 0) {
    console.log(`We have ${events.length} event reminder to send now, Hurray!`);
    // call function on each
    for (let i = 0; i < events.length; i++) {
      events[i].guests.map(val =>
        Ticket.findOne({
          $and: [
            { guest: val }, { eventId: events[i]._id }
          ]
        }).then((result) => {
          // add job to the queue
          Producer({ jobId: Math.random() * 10000, jobName: "SendCreatorReminder", result: result }) // creates data in queue
          console.log("job added to the queue")
        })
      )
    }
  } else {
    return console.log("well, well, well, no creator reminder at this minute");
  }
};

export const guestReminderCron = async () => {

  //gets the current date
  const date = new Date()

  let now_cron = todayToCron(date)//converts to user's timezone because cron was saved in user's timezone

  //check for reminder at this moment
  let ticket = await Ticket.find({
    reminder_cron: now_cron
  });

  if (ticket.length >= 1) {
    console.log(`We have ${ticket.length} ticket reminder to send now, Hurray!`);
    // call function on each
    for (let i = 0; i < ticket.length; i++) {
      // add job to the queue
      Producer({ jobId: Math.random() * 10000, jobName: "SendTicketReminder", ticket: ticket[i] }) // creates data in queue
      console.log("job added to the queue")
    }
  } else {
    return console.log("well, well, well, no guest reminder at this minute");
  }
};