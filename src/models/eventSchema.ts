
import mongoose, { Document, ObjectId } from 'mongoose'

export interface IEvent {
  title: string,
  host: string,
  user: ObjectId,
  status: string,
  tags: string,
  description: string,
  location: string,
  ticketStyle: string,
  ticketPrice: string,
  ticketSold: number,
  guests: [],
  attended: number,
  eventDate: string,
  eventTime: string,
  reminder: string,
  reminder_cron: string,
  rsvp: string,
}

interface IEventDoc extends Document, IEvent { }

const eventSchema = new mongoose.Schema({
  title: {
    type: "string",
    required: true,
    trim: true
  },
  host: {
    type: "string",
    required: true,
  },

  // mongoose.Schema.Types.ObjectId tells model that users is another table in the collection
  // the ref states the table
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    default: "upcoming",
    enum: ["upcoming", "done"],
  },
  tags: {
    type: "string",
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  ticketStyle: {
    type: String,
    default: "Regular",
    enum: ["Regular", "Standard", "Invitation"],
  },
  ticketPrice: {
    type: String,
    default: "0"
  },
  ticketSold: {
    type: Number,
    default: 0
  },
  guests: [],
  attended: {
    type: Number,
    default: 0
  },
  eventDate: {
    type: String,
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
  reminder: {
    type: String,
  },
  reminder_cron: {
    type: String,
  },
  rsvp: {
    type: String,
    required: true,
  }
}, { timestamps: true }

);

//you missed this line, this will search in all fields
// postSchema.index({'$**': 'text'});
// or if you need to search in specific field then replace it by:
// eventSchema.index({title: 'text'});

export const Event = mongoose.model<IEventDoc>("Event", eventSchema);
// export default Event;
