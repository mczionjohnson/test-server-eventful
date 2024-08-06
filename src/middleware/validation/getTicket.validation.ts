
import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);


export const getTicketSchema = Joi.object({
  reminder: Joi.date().iso()
    .greater('now')
    .messages({
      "string.pattern.base":
        `Date format is ISO and UTC timezone. Reminder should be greater than date.now`
    }),
  user: Joi.object(),
  payment: Joi.string(),
});


