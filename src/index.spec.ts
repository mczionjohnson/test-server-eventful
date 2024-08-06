import app from "./index"; // Link to your server file
import supertest from "supertest";

const request = supertest(app);
   // Fake timers using Jest
   beforeEach(() => {
    jest.useFakeTimers()
  })
  
describe('app', () => {
  it("Gets the home endpoint", async () => {
 
    // Sends GET Request to / endpoint
    const response = await request.get("/");

    expect(response.headers["content-type"]).toBe("application/json; charset=utf-8")
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to Eventful");
  });
  // }, 15000); // for longer timeout

 
})

 // Running all pending timers and switching to real timers using Jest
 afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})