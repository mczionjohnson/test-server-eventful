import express from "express"
import helmet from "helmet"


const indexRouter = express.Router()

import { generateMiddleWare } from "../middleware/loginSignup.middleware";
import {
  loginSchema,
  registerSchema,
} from "../middleware/validation/loginSignup.validation";

import { memLogin, memSignup, scanner } from "../controllers/auth.controller";
import checkAuth from "../middleware/auth.middleware";



indexRouter.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.json({ message: "Welcome to Eventful" })
})

indexRouter.post("/register", helmet(), generateMiddleWare(registerSchema), memSignup);

indexRouter.post("/login", helmet(), generateMiddleWare(loginSchema), memLogin);

indexRouter.get('/logout', (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/')
})

// QR scanner 
indexRouter.get("/scan", checkAuth, (req, res) => {

  return res.render("index")
})

//to verify scanned qr
indexRouter.get("/:id", scanner)

export default indexRouter
