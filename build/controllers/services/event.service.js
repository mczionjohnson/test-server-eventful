"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEvents = void 0;
const eventSchema_1 = require("../../models/eventSchema");
const redis_1 = __importDefault(require("../../integrations/redis"));
const logger_1 = __importDefault(require("../../logger/logger"));
const getAllEvents = async (page = 1, limit = 5, query) => {
    try {
        const skip = (page - 1) * limit;
        if (query != null) {
            console.log("query is true:", query);
            //($option m for ^ for the start, $ for the end)
            //($option i for case insensitivity)
            const searchConditionOne = query
                ? { location: { $regex: `^${query}$`, $options: "mi" } }
                : {};
            const searchConditionTwo = query
                ? { host: { $regex: `^${query}$`, $options: "mi" } }
                : {};
            const searchConditionThree = query
                ? { title: { $regex: `^${query}$`, $options: "mi" } }
                : {};
            const searchConditionFour = query
                ? { tags: { $regex: `^${query}$`, $options: "mi" } }
                : {};
            const searchData = await eventSchema_1.Event.find({
                $or: [
                    searchConditionOne,
                    searchConditionTwo,
                    searchConditionThree,
                    searchConditionFour,
                ],
            })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit);
            return { data: searchData, meta: { page, limit } };
        }
        else {
            // set cacheKey and check for cache
            const cacheKey = `allEvents${page}&${limit}`; //dynamic to allow pagination caching
            // get data from database
            const value = await redis_1.default.get(cacheKey);
            // check for cache miss
            if (value != null) {
                console.log("returning data from cache");
                return { data: JSON.parse(value), meta: { page, limit } };
            }
            else {
                // cache miss is true, get data from DB
                console.log("getting data from DB");
                let allEvents = await eventSchema_1.Event.find()
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limit);
                // set cache with expirition of 1 minute
                await redis_1.default.setEx(cacheKey, 1 * 60, JSON.stringify(allEvents));
                return { data: allEvents, meta: { page, limit } };
            }
        }
    }
    catch (error) {
        logger_1.default.error(error);
    }
};
exports.getAllEvents = getAllEvents;
