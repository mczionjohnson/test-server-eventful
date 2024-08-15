"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ticketSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
exports.Ticket = mongoose_1.default.model("Ticket", ticketSchema);
