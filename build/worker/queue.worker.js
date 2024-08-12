"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const bull_1 = __importDefault(require("bull"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Worker = () => {
    console.log("Queue config");
    const queueName = 'background_jobs';
    // A queue for the jobs scheduled based on a routine without any external requests
    const backgroundJob = new bull_1.default(queueName, { redis: process.env.REDIS_URL });
    const listenToQueue = (jobs) => {
        backgroundJob.process((job, done) => {
            switch (job.data.jobName) {
                case 'SendEmail':
                    console.log('processing send email job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Inbox" });
                    break;
                case 'SendWelcomeEmail':
                    console.log('processing send welcome email job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Welcome Alert" });
                    break;
                case 'SendLoginAlert':
                    console.log('processing send login alert job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "login Alert" });
                    break;
                case 'SendEventCreationEmail':
                    console.log('processing send event creation email job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Event Creation Alert" });
                    break;
                case 'SendTicketPurchaseEmail':
                    console.log('processing send ticket purchase job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Ticket Delivered" });
                    break;
                case 'SendQRScannerEmail':
                    console.log('processing send QR scan alert job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "QR Scan Alert Delivered" });
                    break;
                case 'SendGlobalReminder':
                    console.log('processing send global event reminder job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Global reminder Delivered" });
                    break;
                case 'SendTicketReminder':
                    console.log('processing ticket reminder job now');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Ticket reminder sent" });
                    break;
                case 'SendCreatorReminder':
                    console.log('processing event reminder job now');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Event reminder sent" });
                    break;
                case 'SendEventUpdateEmail':
                    console.log('processing update event alert job now');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Update Alert sent" });
                    break;
                case 'SendEventDeleteEmail':
                    console.log('processing delete event alert job now');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "Event deleted alert sent" });
                    break;
                case 'SendSMS':
                    console.log('processing send sms job');
                    jobs[job.data.jobName](job.data);
                    done(null, { message: "SMS sent" });
                    break;
                default:
                    console.log('No job found');
            }
        });
        backgroundJob.on('completed', function (job, result) {
            const jobData = job.data;
            console.log(`job ${jobData.jobId} completed with result: ${JSON.stringify(result)}`);
        });
        backgroundJob.isReady().then(() => {
            console.log('Ready to accept jobs');
        });
    };
    return {
        listenToQueue,
    };
};
exports.Worker = Worker;
