"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendSMS = exports.SendEventDeleteEmail = exports.SendTicketUpdateEmail = exports.SendEventUpdateEmail = exports.SendCreatorReminder = exports.SendTicketReminder = exports.SendGlobalReminder = exports.SendQRScannerEmail = exports.SendTicketPurchaseEmail = exports.SendEventCreationEmail = exports.SendLoginAlert = exports.SendWelcomeEmail = exports.SendEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const googleapis_1 = require("googleapis");
const OAuth2 = googleapis_1.google.auth.OAuth2;
const myOAuth2Client = new OAuth2(process.env.OAUTH_CLIENTID, process.env.OAUTH_CLIENT_SECRET, "https://developers.google.com/oauthplayground");
myOAuth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});
const accessToken = myOAuth2Client.getAccessToken();
let transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: accessToken || ''
    },
});
//re usable function
const messenger = (sender, email, subject, body) => {
    let mailOptions = {
        from: sender,
        to: email,
        subject: subject,
        html: body,
    };
    //  send a mail
    console.log("over to transporter");
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
        }
        else {
            console.log(`Email sent successfully to ${email}`);
        }
    });
};
const SendEmail = (data) => {
    console.log('Sending email to', data.email);
};
exports.SendEmail = SendEmail;
const SendWelcomeEmail = (data) => {
    let sender = "mczionjohnson";
    let subject = "Welcome to Eventful";
    let body = "You have successfully signed up, great to have you with us.";
    messenger(sender, data.email, subject, body);
};
exports.SendWelcomeEmail = SendWelcomeEmail;
const SendLoginAlert = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = "Login Alert";
    let body = "You just logged in, if this is not you please change password immediately.";
    messenger(sender, data.email, subject, body);
};
exports.SendLoginAlert = SendLoginAlert;
const SendEventCreationEmail = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = "New Event created";
    let body = "You just created an event, if this is not you please change password immediately.";
    messenger(sender, data.email, subject, body);
};
exports.SendEventCreationEmail = SendEventCreationEmail;
const SendTicketPurchaseEmail = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = "Ticket Purchase";
    let cloud = `${data.cloud}`;
    let title = `${data.title}`;
    let body = `<p style="font-size:16px;color:#666;" >You just bought a ticket for ${title}. Keep the QR code safe, QR code link: ${cloud}. If this is not you please change password immediately. </p>`;
    messenger(sender, data.email, subject, body);
};
exports.SendTicketPurchaseEmail = SendTicketPurchaseEmail;
const SendQRScannerEmail = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = `Ticket QR code scanned now at ${data.title}`;
    let title = `${data.title}`;
    let body = `<p style="font-size:16px;color:#666;" >Your Ticket's QR Code was just scanned and confirmed at ${title}, ENJOY!. If this is not you please change password immediately. </p>`;
    messenger(sender, data.email, subject, body);
};
exports.SendQRScannerEmail = SendQRScannerEmail;
const SendGlobalReminder = async (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = `Event Reminder from Eventful`;
    let cloud = `${data.result.cloud}`;
    let email = `${data.result.guest_email}`;
    let title = `${data.result.title}`;
    let body = `<p style="font-size:16px;color:#666;" >${title} is today, your ticket's QR code is ${cloud}. See you soon. Remember to keep your login details safe. </p>`;
    messenger(sender, email, subject, body);
};
exports.SendGlobalReminder = SendGlobalReminder;
const SendTicketReminder = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = "Event Reminder";
    let cloud = `${data.ticket.cloud}`;
    let email = `${data.ticket.guest_email}`;
    let title = `${data.ticket.title}`;
    let date = `${data.ticket.eventDate}`;
    let time = `${data.ticket.eventTime}`;
    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> ${title} is on ${date} by ${time}, your ticket's QR code is ${cloud}. See you there. Remember to keep your login details safe. </p>`;
    messenger(sender, email, subject, body);
};
exports.SendTicketReminder = SendTicketReminder;
const SendCreatorReminder = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = `Event Reminder from ${data.result.title}`;
    let cloud = `${data.result.cloud}`;
    let email = `${data.result.guest_email}`;
    let title = `${data.result.title}`;
    let date = `${data.result.eventDate}`;
    let time = `${data.result.eventTime}`;
    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> We are excited to see you at ${title} on ${date} by ${time}, your ticket's QR code is ${cloud}. Be there. Remember to keep your login details safe. </p>`;
    messenger(sender, email, subject, body);
};
exports.SendCreatorReminder = SendCreatorReminder;
const SendEventUpdateEmail = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = `Updated Event Alert`;
    let email = data.email;
    let title = data.title;
    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> ${title} was updated successfully. If this is not you please change password immediately. </p>`;
    messenger(sender, email, subject, body);
};
exports.SendEventUpdateEmail = SendEventUpdateEmail;
const SendTicketUpdateEmail = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = `Updated Reminder Alert`;
    let email = data.email;
    let title = data.title;
    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> Your ticket reminder for ${title} was updated successfully. If this is not you please change password immediately. </p>`;
    messenger(sender, email, subject, body);
};
exports.SendTicketUpdateEmail = SendTicketUpdateEmail;
exports.SendTicketUpdateEmail;
const SendEventDeleteEmail = (data) => {
    let sender = "mczionjohnson@gmail.com";
    let subject = `Deleted Event Alert`;
    let email = data.email;
    let title = data.title;
    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> ${title} was deleted successfully. If this is not you please change password immediately. </p>`;
    messenger(sender, email, subject, body);
};
exports.SendEventDeleteEmail = SendEventDeleteEmail;
const SendSMS = (data) => {
    console.log('Sending sms to', data.phone);
};
exports.SendSMS = SendSMS;
