import Product from "../models/productModel.js";
import Reservation from "../models/reservationModel.js";
import { fetchCurrentProfile } from "./profileServices.js";
import { createRazorpayOrder } from "./paymentServices.js";
import { checkCourierServiceability } from "./shiprocketServices.js";
import { fetchCartItems, fetchCartSummary } from "./cartServices.js";

const prepareCheckout = async (userId, addressId, shippingCost) => {
  const user = await fetchCurrentProfile(userId);

  // Validate address
  const address = user.addresses.find(
    (address) => address._id.toString() === addressId,
  );

  if (!address) {
    throw new Error("Address not found.");
  }

  // Fetch cart items
  const cartItems = await fetchCartItems(userId);

  if (!cartItems.length) {
    throw new Error("Cart is empty.");
  }

  // Clear any existing reservations for this user and restore previous stock(s)
  const existingReservations = await Reservation.find({ userId });

  for (const reservation of existingReservations) {
    // Restore stock to product
    await Product.findByIdAndUpdate(reservation.productId, {
      $inc: { stock: reservation.quantity },
    });

    // Remove previous reservation
    await Reservation.findByIdAndDelete(reservation._id);
  }

  // Re-validate product price + stock
  for (const item of cartItems) {
    const product = await Product.findOne({
      _id: item.productId,
      isActive: true,
    });

    if (!product) {
      throw new Error(`${item.productSnapshot.title} is no longer available.`);
    }

    // Stock check
    if (product.stock < item.quantity) {
      throw new Error(
        `${item.productSnapshot.title} has only ${product.stock} left.`,
      );
    }

    // Price check — if product price changed after cart added
    const effectivePrice = product.discountPrice || product.price;

    if (effectivePrice !== item.productSnapshot.price) {
      throw new Error(
        `${item.productSnapshot.title} price has changed. Please refresh cart.`,
      );
    }

    // Create reservation
    const expiresAt = new Date(Date.now() + 12 * 60 * 1000); // 12 minutes from now
    await Reservation.create({
      productId: item.productId,
      userId,
      quantity: item.quantity,
      expiresAt,
    });

    // Reduce available stock
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  const items = cartItems.map((cartItem) => ({
    productId: cartItem.productId,
    productTitle: cartItem.productSnapshot.title,
    quantity: cartItem.quantity,
    price: cartItem.productSnapshot.price,
    subtotal: cartItem.totalPrice,
    stockVerified: true,
  }));

  // Recalculate final summary: subtotal and shipping cost
  const cartSummary = await fetchCartSummary(userId);
  const subtotalAmount = cartSummary.subtotal + shippingCost;
  const platformFee = +(subtotalAmount * 0.03).toFixed(2); // 3% (2% for razorpay + 1% for website)
  const totalAmount = cartSummary.subtotal + shippingCost + platformFee;

  // Create Razorpay order
  const razorpayOrder = await createRazorpayOrder(userId, totalAmount, {
    email: user.email,
    phone: user.phone,
  });

  // Create payment payload (gateway order). This will be sent to Razorpay order creation API.
  const paymentPayload = {
    gateway: "razorpay",
    amount: totalAmount,
    currency: "INR",
    notes: {
      address,
      customerId: userId,
      customerEmail: user.email,
      customerPhone: user.phone,
    },

    // Razorpay frontend integration fields
    order_id: razorpayOrder.id,
    key: process.env.RAZORPAY_KEY_ID,
    name: "Shobdodhara Prakashani",
    description: "Order payment for books and merchandise",
    prefill: {
      name: user.firstName,
      email: user.email,
      contact: user.phone,
    },
  };

  // Return ready-to-pay payload to frontend
  return {
    checkoutSummary: {
      items,
      subtotal: cartSummary.subtotal,
      deliveryFee: shippingCost,
      platformFee,
      totalPayable: totalAmount,
      saved: cartSummary.saved,
    },

    // Frontend uses this to open Razorpay/Stripe
    paymentPayload,
  };
};

const checkoutAddress = async (
  deliveryPostcode,
  maxLength,
  maxBreadth,
  totalHeight,
  totalWeight,
  cod = 0,
) => {
  const serviceabilityResult = await checkCourierServiceability(
    deliveryPostcode,
    maxLength,
    maxBreadth,
    totalHeight,
    totalWeight,
    cod,
  );

  return serviceabilityResult;
};

export { prepareCheckout, checkoutAddress };
