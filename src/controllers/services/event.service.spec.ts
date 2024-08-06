import { Event } from "../../models/eventSchema";

import { getAllEvents } from "./event.service"

describe("event service", () => {
  // beforeEach(() => {
  //   jest.reset;
  // });

  it("it returns all events", async () => {
    const mockEvents = [
      {
        "title": "Kazakhstan",
        "host": "New York",
        "description": "Chen",
        "tags": "Rena",
        "location": "Yardville",
        "ticketPrice": "20000 NGN",
        "rsvp": "Estrada",
        "eventDate": "09-10-2024",
        "eventTime": "04:00 PM"
      },

    ]

    Event.find = jest
      .fn()
      .mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue(mockEvents),
      });

    const result: any = await getAllEvents(1, 1, "");

    expect(result.data).toEqual(mockEvents);
    expect(result.meta).toEqual({ page: 1, limit: 1});
    expect(Event.find).toHaveBeenCalledTimes(1);
  })
})