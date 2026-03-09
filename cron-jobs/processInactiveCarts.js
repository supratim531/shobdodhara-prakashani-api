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

  // if (!inactiveCarts.length) return;

  const cartIds = inactiveCarts.map((inactiveCart) => inactiveCart._id);

  await markCartsAsAbandoned(cartIds);

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
        const productRows = cartItems
          .map(
            (item) => `
          <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">
              <img src="${item.productSnapshot.image}" alt="${item.productSnapshot.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">
              <strong style="font-size: 16px; color: #333;">${item.productSnapshot.title}</strong><br/>
              <span style="color: #666; font-size: 14px;">SKU: ${item.productSnapshot.sku}</span>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center; color: #666;">
              ${item.quantity}
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
              <strong style="font-size: 16px; color: #e67e22;">₹${item.totalPrice.toFixed(2)}</strong>
            </td>
          </tr>
        `,
          )
          .join("");

        const totalAmount = cartItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0,
        );

        await emailQueue.add(SEND_CART_REMINDER_JOB, {
          email: user.email,
          subject: "🛒 Your cart misses you! Complete your order now",
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
              <div style="background-color: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #2c3e50; text-align: center; margin-bottom: 10px;">Don't let them go! 😊</h1>
                <p style="text-align: center; color: #7f8c8d; font-size: 16px; margin-bottom: 30px;">You left ${cartItems.length} item${cartItems.length > 1 ? "s" : ""} in your cart</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <thead>
                    <tr style="background-color: #f8f9fa;">
                      <th style="padding: 12px; text-align: left; color: #555; font-size: 14px;">Image</th>
                      <th style="padding: 12px; text-align: left; color: #555; font-size: 14px;">Product</th>
                      <th style="padding: 12px; text-align: center; color: #555; font-size: 14px;">Qty</th>
                      <th style="padding: 12px; text-align: right; color: #555; font-size: 14px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productRows}
                  </tbody>
                </table>
                
                <div style="text-align: right; padding: 15px 0; border-top: 2px solid #e67e22;">
                  <span style="font-size: 18px; color: #555;">Total: </span>
                  <strong style="font-size: 22px; color: #e67e22;">₹${totalAmount.toFixed(2)}</strong>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://shobdodharaprakashani.com/cart" style="display: inline-block; background-color: #e67e22; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Complete Your Order</a>
                </div>
                
                <p style="text-align: center; color: #95a5a6; font-size: 14px; margin-top: 20px;">Hurry! Items in your cart are not reserved and may sell out.</p>
              </div>
              
              <p style="text-align: center; color: #95a5a6; font-size: 12px; margin-top: 20px;">© ${new Date().getFullYear()} Shobdodhara Prakashani. All rights reserved.</p>
            </div>
          `,
        });
      }
    }),
  );

  await Promise.all(tasks);
  console.log(
    `----- Total ${inactiveCarts.length} inactive cart(s) processed simultaneously -----`,
  );
};

export default processInactiveCarts;
