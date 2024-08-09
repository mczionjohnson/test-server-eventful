"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const indexRouter = express_1.default.Router();
const loginSignup_middleware_1 = require("../middleware/loginSignup.middleware");
const loginSignup_validation_1 = require("../middleware/validation/loginSignup.validation");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
indexRouter.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.json({ message: "Welcome to Eventful" });
});
indexRouter.post("/register", (0, helmet_1.default)(), (0, loginSignup_middleware_1.generateMiddleWare)(loginSignup_validation_1.registerSchema), auth_controller_1.memSignup);
indexRouter.post("/login", (0, helmet_1.default)(), (0, loginSignup_middleware_1.generateMiddleWare)(loginSignup_validation_1.loginSchema), auth_controller_1.memLogin);
indexRouter.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
});
// QR scanner 
indexRouter.get("/scan", auth_middleware_1.default, (req, res) => {
    return res.render("index");
});
//to verify scanned qr
indexRouter.get("/:id", auth_controller_1.scanner);
exports.default = indexRouter;
