import Product from "../models/productModel.js";
import { fetchCurrentProfile } from "./profileServices.js";
import { fetchCartItems, fetchCartSummary } from "./cartServices.js";

const prepareCheckout = async (userId, addressId) => {
  // Validate address
  const user = await fetchCurrentProfile(userId);
  const address = user.addresses.find(
    (address) => address._id.toString() === addressId
  );

  if (!address) {
    throw new Error("Address not found.");
  }

  // Fetch cart items
  const cartItems = await fetchCartItems(userId);

  if (!cartItems.length) {
    throw new Error("Cart is empty.");
  }

  // Re-validate product price + stock (FINAL validation)
  for (const item of cartItems) {
    const product = await Product.findOne({
      _id: item.productId,
      isActive: true,
    });

    if (!product) {
      throw new Error(`${item.productSnapshot.title} is no longer available.`);
    }

    // Stock check only (no reservation).
    if (product.stock < item.quantity) {
      throw new Error(
        `${item.productSnapshot.title} has only ${product.stock} left.`
      );
    }

    // Price check — if product price changed after cart added
    const effectivePrice = product.discountPrice || product.price;

    if (effectivePrice !== item.productSnapshot.price) {
      throw new Error(
        `${item.productSnapshot.title} price has changed. Please refresh cart.`
      );
    }
  }

  const items = cartItems.map((cartItem) => ({
    productId: cartItem.productId,
    productTitle: cartItem.productSnapshot.title,
    quantity: cartItem.quantity,
    price: cartItem.productSnapshot.price,
    subtotal: cartItem.totalPrice,
    stockVerified: true,
  }));

  // Recalculate final summary: subtotal, coupon, tax & shipping
  const cartSummary = await fetchCartSummary(userId);
  const totalAmount =
    cartSummary.subtotal + cartSummary.tax + cartSummary.shipping;

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
  };

  // Return ready-to-pay payload to frontend
  return {
    checkoutSummary: {
      items,
      subtotal: cartSummary.subtotal,
      saved: cartSummary.saved,
      tax: cartSummary.tax,
      deliveryFee: cartSummary.shipping,
      totalPayable: totalAmount,
    },

    // Frontend uses this to open Razorpay/Stripe
    paymentPayload,
  };
};

export { prepareCheckout };
