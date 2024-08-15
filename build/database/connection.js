"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../logger/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = process.env.DEV_DATABASE;
const connection = async () => {
    mongoose_1.default.connect(db)
        .then(() => {
        logger_1.default.info("Connected to MongoDb");
    })
        .catch((error) => {
        logger_1.default.error("Error: ", error);
    });
};
exports.default = connection;
