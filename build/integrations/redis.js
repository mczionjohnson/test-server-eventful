"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../logger/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL;
const client = (0, redis_1.createClient)({
    url: REDIS_URL
});
client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => {
    logger_1.default.info('Redis client connected');
});
// client.connect();
exports.default = client;
