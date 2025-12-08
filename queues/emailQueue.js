import { Queue } from "bullmq";
import { EMAIL_QUEUE } from "../constants/queues.js";
import { redisClient } from "../config/redisConfig.js";

const emailQueue = new Queue(EMAIL_QUEUE, { connection: redisClient });

export default emailQueue;
