import dotenv from "dotenv";
import { Worker } from "bullmq";
import sendMail from "../utils/sendMail.js";
import { EMAIL_QUEUE } from "../constants/queues.js";
import { redisClient } from "../config/redisConfig.js";
import { connectDatabase } from "../config/dbConfig.js";
import {
  SEND_OTP_EMAIL_JOB,
  SEND_CART_REMINDER_JOB,
} from "../constants/jobs.js";

dotenv.config({ path: "./.env", quiet: true });

connectDatabase();

const emailJobHandlers = {
  [SEND_OTP_EMAIL_JOB]: async (job) => {
    const res = await sendMail(job.data);
    return res;
  },

  [SEND_CART_REMINDER_JOB]: async (job) => {
    const res = await sendMail(job.data);
    return res;
  },
};

const runEmailWorker = async () => {
  console.log("----- Email worker is running -----");

  const worker = new Worker(
    EMAIL_QUEUE,
    async (job) => {
      const handler = emailJobHandlers[job.name];

      if (!handler) throw new Error(`Unknown job: ${job.name}`);

      const returnvalue = await handler(job);
      return returnvalue;
    },
    {
      connection: { ...redisClient, maxRetriesPerRequest: null },
      concurrency: 20,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed:`, job.returnvalue);
  });

  worker.on("failed", (job, failedReason) => {
    console.log(`Job ${job.id} has failed:`, failedReason);
  });
};

runEmailWorker();
