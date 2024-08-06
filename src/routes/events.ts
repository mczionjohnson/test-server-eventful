import { Router } from "express";


import * as eventController from "../controllers/event.controller";
import { generateMiddleWare } from "../middleware/event.middleware"
import { eventCreationSchema } from "../middleware/validation/createEvent.validation"
import { eventUpdateSchema } from "../middleware/validation/updateEvent.validation"

import { getTicketSchema } from "../middleware/validation/getTicket.validation"

import checkAuth from "../middleware/auth.middleware";



const eventRouter = Router();


// get all events
eventRouter.get("/", checkAuth, eventController.getAllEvents);

// create an event
eventRouter.post("/create", checkAuth, generateMiddleWare(eventCreationSchema), eventController.createEvent)

//get one event
eventRouter.get("/:eventId", checkAuth, eventController.getOneEvent);

//buy ticket
eventRouter.post("/:eventId/attend", checkAuth, generateMiddleWare(getTicketSchema), eventController.getTicket);

//update event
eventRouter.patch("/:eventId", checkAuth, generateMiddleWare(eventUpdateSchema), eventController.patchEvent);

//delete event
eventRouter.delete("/:eventId", checkAuth, eventController.deleteEvent);

//share one event
eventRouter.get("/:eventId/share", checkAuth, eventController.shareOneEvent);

//creator gets guest list for an event
eventRouter.get("/:eventId/guests", checkAuth, eventController.guestList);



export default eventRouter;
