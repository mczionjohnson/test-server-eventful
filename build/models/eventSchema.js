"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const eventSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
//you missed this line, this will search in all fields
// postSchema.index({'$**': 'text'});
// or if you need to search in specific field then replace it by:
// eventSchema.index({title: 'text'});
exports.Event = mongoose_1.default.model("Event", eventSchema);
// export default Event;
