import dotenv from "dotenv";
import nodemailer from "nodemailer"

dotenv.config();

import { ITicket, Ticket } from "../models/ticketSchema";


//re usable function
const messenger = (sender: string, email: string, subject: string, body: string) => {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        // auth: {
        //     user: process.env.MAIL_USERNAME,
        //     pass: process.env.MAIL_PASSWORD,
        // }
        secure: true,
        auth: {
            type: "OAuth2",
            user: process.env.MAIL_USERNAME,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
            accessToken: process.env.ACCESS_TOKEN,
            expires: 3599
        },
    } as nodemailer.TransportOptions);

    let mailOptions = {
        from: sender,
        to: email,
        subject: subject,
        html: body,
    };

    //  send a mail
    console.log("over to transporter");
    try {
        transporter.sendMail(mailOptions, function (err: Error | null) {
            if (err) {
                throw err
            } else {
                console.log(`Email sent successfully to ${email}`);
            }
        });
    } catch (err) {
        return console.log("[messenger] Error" + err);
    }

}

export const SendEmail = (data: {
    jobId: number,
    jobName: string,
    email: string
}) => {

    console.log('Sending email to', data.email)
}

export const SendWelcomeEmail = (data: {
    jobId: number,
    jobName: string,
    email: string
}) => {
    let sender = "mczionjohnson"
    let subject = "Welcome to Eventful"
    let body = "You have successfully signed up, great to have you with us."

    messenger(sender, data.email, subject, body)
}

export const SendLoginAlert = (data: {
    jobId: number,
    jobName: string,
    email: string
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = "Login Alert"
    let body = "You just logged in, if this is not you please change password immediately."

    messenger(sender, data.email, subject, body)
}


export const SendEventCreationEmail = (data: {
    jobId: number,
    jobName: string,
    email: string
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = "New Event created"
    let body = "You just created an event, if this is not you please change password immediately."

    messenger(sender, data.email, subject, body)
}

export const SendTicketPurchaseEmail = (data: {
    jobId: number,
    jobName: string,
    email: string,
    cloud: string,
    title: string,
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = "Ticket Purchase"
    let cloud = `${data.cloud}`
    let title = `${data.title}`

    let body = `<p style="font-size:16px;color:#666;" >You just bought a ticket for ${title}. Keep the QR code safe, QR code link: ${cloud}. If this is not you please change password immediately. </p>`

    messenger(sender, data.email, subject, body)
}

export const SendQRScannerEmail = (data: {
    jobId: number,
    jobName: string,
    email: string,
    title: string,
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = `Ticket QR code scanned now at ${data.title}`
    let title = `${data.title}`
    let body = `<p style="font-size:16px;color:#666;" >Your Ticket's QR Code was just scanned and confirmed at ${title}, ENJOY!. If this is not you please change password immediately. </p>`

    messenger(sender, data.email, subject, body)
}

export const SendGlobalReminder = async (data: {
    jobId: number,
    jobName: string,
    result: ITicket,
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = `Event Reminder from Eventful`
    let cloud = `${data.result.cloud}`
    let email = `${data.result.guest_email}`
    let title = `${data.result.title}`

    let body = `<p style="font-size:16px;color:#666;" >${title} is today, your ticket's QR code is ${cloud}. See you soon. Remember to keep your login details safe. </p>`

    messenger(sender, email, subject, body)
}

export const SendTicketReminder = (data: {
    jobId: number,
    jobName: string,
    ticket: ITicket,
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = "Event Reminder"
    let cloud = `${data.ticket.cloud}`
    let email = `${data.ticket.guest_email}`
    let title = `${data.ticket.title}`
    let date = `${data.ticket.eventDate}`
    let time = `${data.ticket.eventTime}`

    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> ${title} is on ${date} by ${time}, your ticket's QR code is ${cloud}. See you there. Remember to keep your login details safe. </p>`

    messenger(sender, email, subject, body)
}

export const SendCreatorReminder = (data: {
    jobId: number,
    jobName: string,
    result: ITicket,
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = `Event Reminder from ${data.result.title}`
    let cloud = `${data.result.cloud}`
    let email = `${data.result.guest_email}`
    let title = `${data.result.title}`
    let date = `${data.result.eventDate}`
    let time = `${data.result.eventTime}`

    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> We are excited to see you at ${title} on ${date} by ${time}, your ticket's QR code is ${cloud}. Be there. Remember to keep your login details safe. </p>`

    messenger(sender, email, subject, body)
}
export const SendEventUpdateEmail = (data: {
    jobId: number,
    jobName: string,
    email: string,
    title: string,
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = `Updated Event Alert`
    let email = data.email
    let title = data.title

    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> ${title} was updated successfully. If this is not you please change password immediately. </p>`

    messenger(sender, email, subject, body)
}
export const SendEventDeleteEmail = (data: {
    jobId: number,
    jobName: string,
    email: string,
    title: string,
}) => {
    let sender = "mczionjohnson@gmail.com"
    let subject = `Deleted Event Alert`
    let email = data.email
    let title = data.title

    let body = `<p style="font-size:16px;color:#666;" >Hi, <br> ${title} was deleted successfully. If this is not you please change password immediately. </p>`

    messenger(sender, email, subject, body)
}

export const SendSMS = (data: {
    jobId: number,
    jobName: string,
    phone: string
}) => {
    console.log('Sending sms to', data.phone)
}
