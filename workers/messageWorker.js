import dotenv from "dotenv";
import { Worker } from "bullmq";
import sendSMS from "../utils/sendSMS.js";
import { SEND_OTP_JOB } from "../constants/jobs.js";
import { MESSAGE_QUEUE } from "../constants/queues.js";
import { redisClient } from "../config/redisConfig.js";
import { connectDatabase } from "../config/dbConfig.js";

const environment = process.env.NODE_ENV || "development";
const ENV_PATH =
  environment === "production" ? "./.env.production" : "./.env.development";

dotenv.config({ path: ENV_PATH, quiet: true });

connectDatabase();

const messageJobHandlers = {
  [SEND_OTP_JOB]: async (job) => {
    const res = await sendSMS(job.data);
    return res;
  },
};

const runMessageWorker = async () => {
  console.log("----- Message worker is running -----");

  const worker = new Worker(
    MESSAGE_QUEUE,
    async (job) => {
      const handler = messageJobHandlers[job.name];

      if (!handler) throw new Error(`Unknown job: ${job.name}`);

      const returnvalue = await handler(job);
      return returnvalue;
    },
    {
      connection: { ...redisClient, maxRetriesPerRequest: null },
      concurrency: 20,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed:`, job.returnvalue);
  });

  worker.on("failed", (job, failedReason) => {
    console.log(`Job ${job.id} has failed:`, failedReason);
  });
};

runMessageWorker();
