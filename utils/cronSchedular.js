import cron from "node-cron";

export const timers = {
  everyTenSecond: "*/10 * * * * *",
  everyTwentySecond: "*/20 * * * * *",
  everyMinute: "* * * * *",
  everyFiveMinute: "*/5 * * * *",
  everySixHour: "1 */6 * * *",
  everyMidnight: "1 0 * * *",
};

export const cronScheduler = (timer, callback) => {
  cron.schedule(timer, callback);
};
