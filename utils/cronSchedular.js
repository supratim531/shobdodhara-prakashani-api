import cron from "node-cron";

export const timers = {
  everyMidnight: "1 0 * * *",
  everyMinute: "* * * * *",
  everyFiveMinute: "*/5 * * * *",
  everySixHour: "1 */6 * * *",
};

export const cronScheduler = (timer, callback) => {
  cron.schedule(timer, callback);
};
