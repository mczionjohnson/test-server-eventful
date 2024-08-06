import { createClient } from 'redis';
import logger from '../logger/logger'

import dotenv from "dotenv"

dotenv.config()
const REDIS_URL: any = process.env.REDIS_URL


const client = createClient({
     url: REDIS_URL
});

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => {
    logger.info('Redis client connected')
})

// client.connect();


export default client