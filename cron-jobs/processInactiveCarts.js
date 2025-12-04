import emailQueue from "../queues/emailQueue.js";
import { SEND_CART_REMINDER_JOB } from "../constants/jobs.js";
import {
  fetchInactiveCarts,
  markCartsAsAbandoned,
} from "../services/cartServices.js";

const processInactiveCarts = async () => {
  const inactiveCarts = await fetchInactiveCarts();

  if (!inactiveCarts.length) return;

  const cartIds = inactiveCarts.map((inactiveCart) => inactiveCart._id);

  await markCartsAsAbandoned(cartIds);

  const mail = {
    subject: "Your cart is waiting 🛒",
    body: `
      <h1 style="text-align: center;">Still thinking about it? It might sell out 😬</h1>
      <p style="text-align: left;">Just a reminder — you left some items in your cart.</p>
      <p style="text-align: left;">It'll take only 10 seconds to finish your order.</p>
      <br/>
      <p style="text-align: left;">Come back anytime — your items are ready for you!</p>
    `,
  };

  for (const cart of inactiveCarts) {
    await emailQueue.add(SEND_CART_REMINDER_JOB, {
      userId: cart.userId,
      mail,
    });
  }

  console.log("----- Inactive carts processed successfully -----");
};

export default processInactiveCarts;
