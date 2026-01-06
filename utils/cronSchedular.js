import cron from "node-cron";

export const timers = {
  everyTenSecond: "*/10 * * * * *",
  everyTwentySecond: "*/20 * * * * *",
  everyMinute: "* * * * *",
  everyThreeMinute: "*/3 * * * *",
  everyFiveMinute: "*/5 * * * *",
  everySixHour: "1 */6 * * *",
  everyTweleveHour: "1 */12 * * *",
  everyMidnight: "1 0 * * *",
};

export const cronScheduler = (timer, callback) => {
  cron.schedule(timer, callback);
};
