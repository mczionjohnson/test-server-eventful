"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producer = void 0;
const bull_1 = __importDefault(require("bull"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Producer = (data) => {
    const queueName = 'background_jobs';
    // A queue for the jobs scheduled based on a routine without any external requests
    const backgroundJob = new bull_1.default(queueName, { redis: process.env.REDIS_URL });
    backgroundJob.add(data); // adds data to queue
};
exports.Producer = Producer;
