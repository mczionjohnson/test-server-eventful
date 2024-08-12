"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required()
        .messages({
        "string.pattern.base": 'Password can contain only letters, numbers and be between 3 and 30 characters long.',
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
