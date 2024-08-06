
import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);


export const eventCreationSchema = Joi.object({
  title: Joi.string()
    .pattern(new RegExp("[A-Za-z0-9]"))
    .required() //Please provide the event's title
    .messages({
      "string.pattern.base":
        "Title can be alphanumeric",
    }),
  host: Joi.string()
    .pattern(new RegExp("[A-Za-z0-9]"))
    .required()
    .messages({
      "string.pattern.base":
        "Host can be alphanumeric",
    }),
  tags: Joi.string()
    .pattern(new RegExp("[A-Za-z0-9]|[0-9A-Z]|[0-9a-z],?@?_?-?&?#? ?"))
    .messages({
      "string.pattern.base":
        "Tags can be alphanumeric, it can also contain , @ _ - & : #",
    }),
  ticketStyle: Joi.string()
    .pattern(new RegExp("^(Regular|Standard|Invitation)$"))
    .messages({
      "string.pattern.base":
        "Ticket Style can be Regular, Standard or Invitation",
    }),
  ticketPrice: Joi.string()
    .pattern(new RegExp("^[0-9]+ ?(USD|GBP|EUR|NGN)$"))//9000 NGN
    .required()
    .messages({
      "string.pattern.base":
        "Ticket price can be USD, GBP, EUR or NGN",
    }),

  description: Joi.string()
    .required()
    .messages({
      "string.pattern.base":
        "Description can match any character",
    }),
  location: Joi.string()
    .pattern(new RegExp("[A-Za-z0-9]|[0-9A-Z]|[0-9a-z],?@?_?-?&? ?"))//u? sets u optional"
    .required()
    .messages({
      "string.pattern.base":
        "Location can be alphanumeric, it can also contain , @ _ - &",
    }),
  rsvp: Joi.string()
    .pattern(new RegExp("[A-Za-z0-9]|A-Z|a-z|,?@?_?-?&?:? ?"))
    .required()
    .messages({
      "string.pattern.base":
        "RSVP can be alphanumeric, it can also contain , @ _ - & :",
    }),
  eventDate: Joi.date().iso()
    .greater('now')
    .required()
    .messages({
      "string.pattern.base":
        `Date format is ISO Event date should be greater than date.now`
    }),
  eventTime: Joi.string()
    .pattern(new RegExp("^([1-9]|0[1-9]|1[0-2]):[0-5][0-9] ?([AP]M|[ap]m)$"))
    .required()
    .messages({
      "string.pattern.base":
        "Time format is 12 hours; 12:45 AM or 03:20 pm",
    }),
  reminder: Joi.date().iso()
    .greater('now')
    .messages({
      "string.pattern.base":
        `Date format is ISO and UTC timezone. Reminder should be greater than date.now`
    }),
  user: Joi.object()
});


