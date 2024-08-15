"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const date_1 = __importDefault(require("@joi/date"));
const Joi = joi_1.default.extend(date_1.default);
exports.getTicketSchema = Joi.object({
    reminder: Joi.date().iso()
        .greater('now')
        .messages({
        "string.pattern.base": `Date format is ISO and UTC timezone. Reminder should be greater than date.now`
    }),
    user: Joi.object(),
    payment: Joi.string(),
});
