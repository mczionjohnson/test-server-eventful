"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secret = process.env.JWT_SECRET;
// const checkAuth = (req: Request, res: Response, next: NextFunction) => {
//   // logger.debug("Auth middleware");
//   // get the Authorization header
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res.status(401).json({ message: "Unauthorized1" });
//   }
//   // logger.debug("Authorization", authorization);
//   const bearerToken = authorization.split(" ");
//   if (bearerToken.length !== 2) {
//     return res.status(401).json({ message: "Unauthorized2" });
//   }
//   // logger.debug("Token", bearerToken[1]);
//   const decoded = jwt.verify(bearerToken[1], secret);
//   req.body.user = decoded; //passing it on
//   next();
// };
const checkAuth = (req, res, next) => {
    // because of cookie-parser and we named it 'jwt'
    const token = req.cookies.jwt;
    // check
    if (token != null) {
        // SECRET is stored in .env
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err) {
                // res.redirect('/')
                return res.status(401).json({ message: "Unauthorized1" });
            }
            else {
                // calling next since the check is successful
                req.body.user = decoded; //passing it on
                next();
            }
        });
    }
    else {
        // res.redirect('/')
        return res.status(401).json({ message: "Unauthorized1" });
    }
};
exports.default = checkAuth;
