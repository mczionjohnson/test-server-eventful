import { Router } from "express";

import * as userController from "../controllers/user.controller";

import checkAuth from "../middleware/auth.middleware";

const userRouter = Router();



//get user's profile
userRouter.get("/profile", checkAuth, userController.getUserProfile)

userRouter.get("/profile/event_attended", checkAuth, userController.getEventAttended)

userRouter.get("/profile/tickets", checkAuth, userController.getUserTickets)

userRouter.get("/profile/tickets/:id", checkAuth, userController.viewOneTicket)

userRouter.patch("/profile/tickets/:id", checkAuth, userController.editOneTicket)


//get event created by user
userRouter.get("/profile/event_created", checkAuth, userController.getUserEvents)



export default userRouter;
