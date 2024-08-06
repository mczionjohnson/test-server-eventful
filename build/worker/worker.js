"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_worker_1 = require("./queue.worker");
const email_worker_1 = require("./email.worker");
console.log("workers accessing the queue");
(0, queue_worker_1.Worker)().listenToQueue({
    SendEmail: email_worker_1.SendEmail,
    SendSMS: email_worker_1.SendSMS,
    SendWelcomeEmail: email_worker_1.SendWelcomeEmail,
    SendLoginAlert: email_worker_1.SendLoginAlert,
    SendEventCreationEmail: email_worker_1.SendEventCreationEmail,
    SendTicketPurchaseEmail: email_worker_1.SendTicketPurchaseEmail,
    SendQRScannerEmail: email_worker_1.SendQRScannerEmail,
    SendGlobalReminder: email_worker_1.SendGlobalReminder,
    SendTicketReminder: email_worker_1.SendTicketReminder,
    SendCreatorReminder: email_worker_1.SendCreatorReminder,
    SendEventDeleteEmail: email_worker_1.SendEventDeleteEmail,
    SendEventUpdateEmail: email_worker_1.SendEventUpdateEmail,
    SendTicketUpdateEmail: email_worker_1.SendTicketUpdateEmail,
});
