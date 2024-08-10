import { Worker } from "./queue.worker"
import {
    SendEmail, SendSMS, SendWelcomeEmail,
    SendLoginAlert, SendEventCreationEmail,
    SendTicketPurchaseEmail, SendQRScannerEmail,
    SendGlobalReminder, SendTicketReminder,
    SendCreatorReminder, SendEventUpdateEmail,
    SendEventDeleteEmail,
} from './email.worker';


console.log("workers accessing the queue")
Worker().listenToQueue({
    SendEmail,
    SendSMS,
    SendWelcomeEmail,
    SendLoginAlert,
    SendEventCreationEmail,
    SendTicketPurchaseEmail,
    SendQRScannerEmail,
    SendGlobalReminder,
    SendTicketReminder,
    SendCreatorReminder,
    SendEventDeleteEmail,
    SendEventUpdateEmail,
})