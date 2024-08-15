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
const express_1 = require("express");
const eventController = __importStar(require("../controllers/event.controller"));
const event_middleware_1 = require("../middleware/event.middleware");
const createEvent_validation_1 = require("../middleware/validation/createEvent.validation");
const updateEvent_validation_1 = require("../middleware/validation/updateEvent.validation");
const getTicket_validation_1 = require("../middleware/validation/getTicket.validation");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const eventRouter = (0, express_1.Router)();
// get all events
eventRouter.get("/", auth_middleware_1.default, eventController.getAllEvents);
// create an event
eventRouter.post("/create", auth_middleware_1.default, (0, event_middleware_1.generateMiddleWare)(createEvent_validation_1.eventCreationSchema), eventController.createEvent);
//get one event
eventRouter.get("/:eventId", auth_middleware_1.default, eventController.getOneEvent);
//buy ticket
eventRouter.post("/:eventId/attend", auth_middleware_1.default, (0, event_middleware_1.generateMiddleWare)(getTicket_validation_1.getTicketSchema), eventController.getTicket);
//update event
eventRouter.patch("/:eventId", auth_middleware_1.default, (0, event_middleware_1.generateMiddleWare)(updateEvent_validation_1.eventUpdateSchema), eventController.patchEvent);
//delete event
eventRouter.delete("/:eventId", auth_middleware_1.default, eventController.deleteEvent);
//share one event
eventRouter.get("/:eventId/share", auth_middleware_1.default, eventController.shareOneEvent);
//creator gets guest list for an event
eventRouter.get("/:eventId/guests", auth_middleware_1.default, eventController.guestList);
exports.default = eventRouter;
