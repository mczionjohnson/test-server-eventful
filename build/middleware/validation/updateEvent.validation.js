"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventUpdateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const date_1 = __importDefault(require("@joi/date"));
const Joi = joi_1.default.extend(date_1.default);
exports.eventUpdateSchema = Joi.object({
    title: Joi.string()
        .pattern(new RegExp("[A-Za-z0-9]"))
        .messages({
        "string.pattern.base": "Title can be alphanumeric",
    }),
    host: Joi.string()
        .pattern(new RegExp("[A-Za-z0-9]"))
        .messages({
        "string.pattern.base": "Host can be alphanumeric",
    }),
    tags: Joi.string()
        .pattern(new RegExp("[A-Za-z0-9]|[0-9A-Z]|[0-9a-z],?@?_?-?&?#? ?"))
        .messages({
        "string.pattern.base": "Tags can be alphanumeric, it can also contain , @ _ - & : #",
    }),
    ticketStyle: Joi.string()
        .pattern(new RegExp("^(Regular|Standard|Invitation)$"))
        .messages({
        "string.pattern.base": "Ticket Style can be Regular, Standard or strictly by Invitation",
    }),
    ticketPrice: Joi.string()
        .pattern(new RegExp("^[0-9]+ ?(USD|GBP|EUR|NGN)$")) //9000 NGN
        .messages({
        "string.pattern.base": "Ticket price can be USD, GBP, EUR or NGN",
    }),
    description: Joi.string()
        .messages({
        "string.pattern.base": "Description can match any character",
    }),
    location: Joi.string()
        .pattern(new RegExp("[A-Za-z0-9]|[0-9A-Z]|[0-9a-z],?@?_?-?&? ?")) //? sets u optional"
        .messages({
        "string.pattern.base": "Location can be alphanumeric, it can also contain , @ _ - &",
    }),
    rsvp: Joi.string()
        .pattern(new RegExp("[A-Za-z0-9]|A-Z|a-z|,?@?_?-?&?:? ?"))
        .messages({
        "string.pattern.base": "RSVP can be alphanumeric, it can also contain , @ _ - & :",
    }),
    eventDate: Joi.date().iso()
        .greater('now')
        .messages({
        "string.pattern.base": `Date format is ISO Event date should be greater than date.now`
    }),
    eventTime: Joi.string()
        .pattern(new RegExp("^([1-9]|0[1-9]|1[0-2]):[0-5][0-9] ?([AP]M|[ap]m)$"))
        .messages({
        "string.pattern.base": "Time format is 12 hours; 12:45 AM or 03:20 pm",
    }),
    reminder: Joi.date().iso()
        .greater('now')
        .messages({
        "string.pattern.base": `Date format is ISO and UTC timezone. Reminder should be greater than date.now`
    }),
    user: Joi.object()
});
