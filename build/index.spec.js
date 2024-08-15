"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index")); // Link to your server file
const supertest_1 = __importDefault(require("supertest"));
const request = (0, supertest_1.default)(index_1.default);
// Fake timers using Jest
beforeEach(() => {
    jest.useFakeTimers();
});
describe('app', () => {
    it("Gets the home endpoint", async () => {
        // Sends GET Request to / endpoint
        const response = await request.get("/");
        expect(response.headers["content-type"]).toBe("application/json; charset=utf-8");
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Welcome to Eventful");
    });
    // }, 15000); // for longer timeout
});
// Running all pending timers and switching to real timers using Jest
afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});
