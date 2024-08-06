import Bull from 'bull'
import dotenv from "dotenv"

dotenv.config()

export const Producer = (data: any) => {
  const queueName = 'background_jobs';

  // A queue for the jobs scheduled based on a routine without any external requests
  const backgroundJob = new Bull(queueName, { redis: process.env.REDIS_URL });

  backgroundJob.add(data) // adds data to queue
}

