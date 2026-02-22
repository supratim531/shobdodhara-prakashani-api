import { Queue } from "bullmq";
import { MESSAGE_QUEUE } from "../constants/queues.js";
import { redisClient } from "../config/redisConfig.js";

const messageQueue = new Queue(MESSAGE_QUEUE, { connection: redisClient });

export default messageQueue;
