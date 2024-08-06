
import mongoose, { Document, ObjectId } from 'mongoose'

export interface ITicket {
  title: string,
  user: string
  eventId: string
  location: string,
  ticketStyle: string,
  ticketPrice: string,
  guest: string,
  guest_email: string,
  eventDate: string,
  eventTime: string,
  cloud: string,
  reminder: string,
  reminder_cron: string,
}

interface ITicketDoc extends Document, ITicket { }

const ticketSchema = new mongoose.Schema({
  title: {
    type: "string",
    required: true,
    trim: true
  },
  // mongoose.Schema.Types.ObjectId tells model that users is another table in the collection
  // the ref states the table
  user: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  ticketStyle: {
    type: String,
    required: true,
  },
  ticketPrice: {
    type: String,
  },
  cloud: {
    type: String,
  },
  guest: {
    type: String,
    required: true,
  },
  guest_email: {
    type: String,
    required: true,
  },
  reminder_cron: {
    type: String,
  },
  reminder: {
    type: String,
  },
  eventDate: {
    type: String,
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
}, { timestamps: true }

);



export const Ticket = mongoose.model<ITicketDoc>("Ticket", ticketSchema);
