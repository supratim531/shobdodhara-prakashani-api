import axios from "axios";
import AppLogger from "../utils/logger.js";
import Order from "../models/orderModel.js";

let authToken = null;
let tokenExpiry = null;

const shiprocketLogin = async () => {
  try {
    const response = await axios.post(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/auth/login`,
      {
        email: process.env.SHIPROCKET_API_USER_EMAIL,
        password: process.env.SHIPROCKET_API_USER_PASS,
      },
    );

    authToken = response.data.token;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

    return authToken;
  } catch (error) {
    throw new Error(
      `Shiprocket login failed: ${
        error.response?.data?.message || error.message
      }`,
    );
  }
};

const getValidToken = async () => {
  if (!authToken || Date.now() >= tokenExpiry) {
    await shiprocketLogin();
  }

  return authToken;
};

const createShiprocketOrder = async (orderId, paymentMethod) => {
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
    let maxLength = 0;
    let maxBreadth = 0;
    let totalHeight = 0;
    let totalWeight = 0;

    const orderItems = order.items.map((item) => {
      const snapshot = item.productSnapshot;
      maxLength = Math.max(maxLength, snapshot.length);
      maxBreadth = Math.max(maxBreadth, snapshot.breadth);
      totalHeight += snapshot.height * item.quantity;
      totalWeight += snapshot.weight * item.quantity;

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
      pickup_location: "warehouse",
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
      payment_method: paymentMethod,
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
      },
    );

    console.log("Shiprocket create order response:");
    console.dir(response.data, { depth: null });
    AppLogger.info(
      `Shiprocket order created for order ${orderId}`,
      response.data,
    );

    // Update order with Shiprocket details
    await Order.findByIdAndUpdate(orderId, {
      shiprocketOrderId: response.data.order_id.toString(),
      shiprocketShipmentId: response.data.shipment_id.toString(),
      shiprocketStatus: response.data.status,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Shiprocket order creation failed: ${
        error.response?.data?.message || error.message
      }`,
    );
  }
};

const checkCourierServiceability = async (
  deliveryPostcode,
  maxLength,
  maxBreadth,
  totalHeight,
  totalWeight,
  cod = 0,
) => {
  try {
    const token = await getValidToken();
    const response = await axios.get(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/courier/serviceability`,
      {
        params: {
          pickup_postcode: 711201,
          delivery_postcode: deliveryPostcode,
          length: maxLength,
          breadth: maxBreadth,
          height: totalHeight,
          weight: totalWeight,
          cod: cod,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const availableCouriers = response.data.data.available_courier_companies;
    const recommendedCourierId =
      response.data.data.recommended_courier_company_id;

    // Find the recommended courier object
    const recommendedCourier = availableCouriers.find(
      (courier) => courier.courier_company_id === recommendedCourierId,
    );

    return {
      recommendedCourierId,
      recommendedCourier,
      shippingCost: recommendedCourier
        ? recommendedCourier.freight_charge + 15
        : 0,
    };
  } catch (error) {
    throw new Error(
      `Courier serviceability check failed: ${
        error.response?.data?.message || error.message
      }`,
    );
  }
};

const assignCourier = async (orderId, shipmentId, courierId, orderStatus) => {
  try {
    const token = await getValidToken();
    const order = await Order.findById(orderId);

    if (!order || !order.shiprocketOrderId) {
      throw new Error("Order not found or Shiprocket order not created");
    }

    const response = await axios.post(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/courier/assign/awb`,
      {
        shipment_id: shipmentId,
        courier_id: courierId,
        status: orderStatus,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Courier assignment response:");
    console.dir(response.data, { depth: null });
    AppLogger.info(`Courier assigned for order ${orderId}`, response.data);

    // Update order with courier assignment details
    await Order.findByIdAndUpdate(orderId, {
      awbCode: response.data.response.data.awb_code,
      courierCompany: response.data.response.data.courier_name,
    });

    return response.data;
  } catch (error) {
    AppLogger.error("Courier assignment error:", error, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(
      `Courier assignment failed: ${
        error.response?.data?.message || error.response?.data || error.message
      }`,
    );
  }
};

const generateLabel = async (...shipmentIds) => {
  try {
    const token = await getValidToken();
    const response = await axios.post(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/courier/generate/label`,
      {
        shipment_id: shipmentIds,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    AppLogger.error("Label generation failed:", error, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(
      `Could not generate label: ${
        error.response?.data?.message || error.response?.data || error.message
      }`,
    );
  }
};

const schedulePickup = async (orderId, shipmentId) => {
  try {
    const token = await getValidToken();
    const order = await Order.findById(orderId);

    if (!order || !order.shiprocketOrderId) {
      throw new Error("Order not found or Shiprocket order not created");
    }

    const response = await axios.post(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/courier/generate/pickup`,
      {
        shipment_id: [shipmentId],
        status: "retry",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Schedule pickup response:");
    console.dir(response.data, { depth: null });
    AppLogger.info(`Pickup scheduled for order ${orderId}`, response.data);

    // Update order with pickup details
    await Order.findByIdAndUpdate(orderId, {
      shiprocketStatus: "PICKUP SCHEDULED",
      lastStatusUpdate: new Date(),
    });

    return response.data;
  } catch (error) {
    AppLogger.error("Pickup scheduling error:", error, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(
      `Pickup scheduling failed: ${
        error.response?.data?.message || error.response?.data || error.message
      }`,
    );
  }
};

const trackShipment = async (awbCode) => {
  try {
    const token = await getValidToken();
    const response = await axios.get(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/courier/track/awb/${awbCode}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Shipment tracking failed: ${
        error.response?.data?.message || error.message
      }`,
    );
  }
};

const getShipmentStatus = async (shiprocketOrderId) => {
  try {
    const token = await getValidToken();
    const response = await axios.get(
      `${process.env.SHIPROCKET_API_BASE_URL}/external/orders/show/${shiprocketOrderId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Get shipment status failed: ${
        error.response?.data?.message || error.message
      }`,
    );
  }
};

const handleWebhook = async (webhookData) => {
  const { order_id, ...rest } = webhookData;
  const current_status = rest.current_status.toUpperCase();

  // Find order by database order id
  const order = await Order.findById(order_id);

  if (!order) {
    AppLogger.warn(`Order not found for order ID: ${order_id}`);

    return { success: true, message: "Order not found." };
  }

  // // Check idempotency - avoid processing same status twice
  // if (order.shiprocketStatus === current_status && order.lastStatusUpdate) {
  //   AppLogger.warn(
  //     `Status ${current_status} already processed for order ${order._id}`,
  //   );

  //   return { success: true, message: "Already processed." };
  // }

  // Map Shiprocket status to order status
  const statusMapping = {
    "AWB ASSIGNED": "CONFIRMED",
    "PICKUP SCHEDULED": "CONFIRMED",
    "PICKUP GENERATED": "PROCESSING",
    "OUT FOR PICKUP": "PROCESSING",
    "PICKED UP": "SHIPPED",
    "IN TRANSIT": "IN_TRANSIT",
    "OUT FOR DELIVERY": "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    "RTO INITIATED": "CANCELLED",
    CANCELED: "CANCELLED",
  };

  const mappedStatus = statusMapping[current_status];
  const updateFields = {
    shiprocketStatus: current_status,
    lastStatusUpdate: new Date(),
  };

  // Update order status if mapping exists
  if (mappedStatus) {
    updateFields.status = mappedStatus;
  }

  // Set deliveredAt timestamp if delivered
  if (current_status === "DELIVERED") {
    updateFields.deliveredAt = new Date();
  }

  await Order.findByIdAndUpdate(order._id, { $set: updateFields });
  AppLogger.info(`Order ${order._id} updated with status: ${current_status}`);

  return {
    success: true,
    orderId: order._id,
    status: current_status,
    orderStatus: mappedStatus,
  };
};

export {
  getValidToken,
  createShiprocketOrder,
  checkCourierServiceability,
  assignCourier,
  generateLabel,
  schedulePickup,
  trackShipment,
  getShipmentStatus,
  handleWebhook,
};
