import axios from "axios";
import Order from "../models/orderModel.js";

let authToken = null;
let tokenExpiry = null;

// Hardcoded pickup location
const PICKUP_LOCATION = {
  name: "Main Warehouse",
  address: "123 Business Park",
  city: "New Delhi",
  state: "Delhi",
  pincode: "110001",
  phone: "9876543210",
};

const shiprocketLogin = async () => {
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/auth/login`,
      {
        email: process.env.SHIPROCKET_API_USER_EMAIL,
        password: process.env.SHIPROCKET_API_USER_PASS,
      }
    );

    authToken = response.data.token;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

    return authToken;
  } catch (error) {
    throw new Error(
      `Shiprocket login failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

const getValidToken = async () => {
  if (!authToken || Date.now() >= tokenExpiry) {
    await shiprocketLogin();
  }

  return authToken;
};

const createShiprocketOrder = async (orderId) => {
  try {
    const token = await getValidToken();

    // Fetch order with items and user details
    const orderData = await Order.aggregate([
      { $match: { _id: orderId } },

      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "orderId",
          as: "items",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },
    ]);

    if (!orderData.length) {
      throw new Error("Order not found");
    }

    const order = orderData[0];
    const user = order.user;
    const shippingAddress = order.shippingAddress;

    // Calculate totals and dimensions
    let totalWeight = 0;
    let maxLength = 0;
    let maxBreadth = 0;
    let totalHeight = 0;

    const orderItems = order.items.map((item) => {
      const snapshot = item.productSnapshot;
      totalWeight += snapshot.weight * item.quantity;
      maxLength = Math.max(maxLength, snapshot.length);
      maxBreadth = Math.max(maxBreadth, snapshot.breadth);
      totalHeight += snapshot.height * item.quantity;

      return {
        name: snapshot.title,
        sku: snapshot.sku,
        units: item.quantity,
        selling_price: snapshot.price,
        discount: "",
        tax: "",
      };
    });

    const shiprocketPayload = {
      order_id: order._id.toString(),
      order_date: new Date(order.orderedAt)
        .toISOString()
        .slice(0, 16)
        .replace("T", " "),
      pickup_location: PICKUP_LOCATION.name,
      comment: `Order from Shobdodhara Prakashani`,
      billing_customer_name:
        shippingAddress.recipientName.split(" ")[0] ||
        shippingAddress.recipientName,
      billing_last_name:
        shippingAddress.recipientName.split(" ").slice(1).join(" ") || "",
      billing_address: shippingAddress.addressDetails,
      billing_address_2: shippingAddress.landmark || "",
      billing_city: shippingAddress.city,
      billing_pincode: parseInt(shippingAddress.zipCode),
      billing_state: shippingAddress.state,
      billing_country: "India",
      billing_email: user.email,
      billing_phone: parseInt(shippingAddress.phone),
      shipping_is_billing: true,
      shipping_customer_name: "",
      shipping_last_name: "",
      shipping_address: "",
      shipping_address_2: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_country: "",
      shipping_state: "",
      shipping_email: "",
      shipping_phone: "",
      order_items: orderItems,
      payment_method: "Prepaid",
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.totalPrice,
      length: maxLength,
      breadth: maxBreadth,
      height: totalHeight,
      weight: totalWeight,
    };

    const response = await axios.post(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/orders/create/adhoc`,
      shiprocketPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.dir(response, { depth: null });

    // Update order with Shiprocket details
    await Order.findByIdAndUpdate(orderId, {
      shiprocketOrderId: response.data.order_id.toString(),
      shiprocketStatus: "CREATED",
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Shiprocket order creation failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

export { shiprocketLogin, getValidToken, createShiprocketOrder };
