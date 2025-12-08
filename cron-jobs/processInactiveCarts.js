import pLimit from "p-limit";
import emailQueue from "../queues/emailQueue.js";
import { SEND_CART_REMINDER_JOB } from "../constants/jobs.js";
import { fetchCurrentProfile } from "../services/profileServices.js";
import {
  fetchCartItems,
  fetchInactiveCarts,
  markCartsAsAbandoned,
} from "../services/cartServices.js";

const limit = pLimit(10); // process max 10 carts at a time

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

  // me: sequential approach
  // for (const cart of inactiveCarts) {
  //   const user = await fetchCurrentProfile(cart.userId);
  //   const cartItems = await fetchCartItems(user._id);

  //   if (!cartItems.length) {
  //     continue;
  //   } else if (user.email) {
  //     await emailQueue.add(SEND_CART_REMINDER_JOB, {
  //       email: user.email,
  //       ...mail,
  //     });
  //   }
  // }

  // console.log("----- All inactive carts are processed successfully -----");

  // =============================================================================== //

  // me: simultaneous approach
  // await Promise.all(
  //   inactiveCarts.map(async (cart) => {
  //     const user = await fetchCurrentProfile(cart.userId);
  //     const cartItems = await fetchCartItems(user._id);

  //     if (!cartItems.length) return;

  //     if (user.email) {
  //       return emailQueue.add(SEND_CART_REMINDER_JOB, {
  //         email: user.email,
  //         ...mail,
  //       });
  //     }
  //   })
  // );
  // console.log("----- All inactive carts are processed simultaneously -----");

  // =============================================================================== //

  // ChatGPT: simultaneous approach with the industry standard
  const tasks = inactiveCarts.map((cart) =>
    limit(async () => {
      const user = await fetchCurrentProfile(cart.userId);
      const cartItems = await fetchCartItems(user._id, cart._id);

      if (!cartItems.length) return;

      if (user.email) {
        await emailQueue.add(SEND_CART_REMINDER_JOB, {
          email: user.email,
          ...mail,
        });
      }
    })
  );
  await Promise.all(tasks);
  console.log("----- Inactive carts are processed simultaneously -----");
};

export default processInactiveCarts;
