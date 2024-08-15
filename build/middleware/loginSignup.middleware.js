"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMiddleWare = void 0;
const logger_1 = __importDefault(require("../logger/logger"));
const generateMiddleWare = (schema) => {
    return (req, res, next) => {
        // Middleware logic
        if (schema) {
            const result = schema.validate(req.body);
            logger_1.default.info("validator", result);
            if (result.error) {
                logger_1.default.error(result.error);
                return res
                    .status(422)
                    .json({ message: "Validation error", errors: result.error });
            }
        }
        next();
    };
};
exports.generateMiddleWare = generateMiddleWare;
