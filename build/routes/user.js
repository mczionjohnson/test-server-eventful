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
const userController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const userRouter = (0, express_1.Router)();
//get user's profile
userRouter.get("/profile", auth_middleware_1.default, userController.getUserProfile);
userRouter.get("/profile/event_attended", auth_middleware_1.default, userController.getEventAttended);
userRouter.get("/profile/tickets", auth_middleware_1.default, userController.getUserTickets);
userRouter.get("/profile/tickets/:id", auth_middleware_1.default, userController.viewOneTicket);
userRouter.patch("/profile/tickets/:id", auth_middleware_1.default, userController.editOneTicket);
//get event created by user
userRouter.get("/profile/event_created", auth_middleware_1.default, userController.getUserEvents);
exports.default = userRouter;
