import cron from "node-cron";

export const timers = {
  everyTenSecond: "*/10 * * * * *",
  everyTwentySecond: "*/20 * * * * *",
  everyMinute: "* * * * *",
  everyThreeMinute: "*/3 * * * *",
  everyFiveMinute: "*/5 * * * *",
  everyFifteenMinute: "*/15 * * * *",
  everyThirtyMinute: "*/30 * * * *",
  everyHour: "0 * * * *",
  everyTwoHour: "1 */2 * * *",
  everySixHour: "1 */6 * * *",
  everyTweleveHour: "1 */12 * * *",
  everyMidnight: "1 0 * * *",
};

export const cronScheduler = (timer, callback) => {
  cron.schedule(timer, callback);
};
