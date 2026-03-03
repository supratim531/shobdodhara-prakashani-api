import { scheduleDelayedPickups } from "../services/shiprocketServices.js";

const processDelayedPickups = async () => {
  await scheduleDelayedPickups();
  console.log("----- Delayed pickup scheduling process completed -----");
};

export default processDelayedPickups;
