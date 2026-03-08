import dotenv from "dotenv";
import Order from "../models/orderModel.js";
import emailQueue from "../queues/emailQueue.js";
import { generateLabel } from "./shiprocketServices.js";
import {
  SEND_ORDER_CONFIRMATION_JOB,
  SEND_ENQUIRY_JOB,
  SEND_JOIN_REQUEST_JOB,
} from "../constants/jobs.js";

const environment = process.env.NODE_ENV || "development";
const ENV_PATH =
  environment === "production" ? "./.env.production" : "./.env.development";

dotenv.config({ path: ENV_PATH, quiet: true });

const sendOrderConfirmationEmail = async (orderId) => {
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

  let labelUrl = "";
  const order = orderData[0];
  const user = order.user;
  const shippingAddress = order.shippingAddress;

  if (order.shiprocketShipmentId) {
    try {
      const generatedLabel = await generateLabel(order.shiprocketShipmentId);
      labelUrl = generatedLabel.label_url || "";
    } catch (error) {
      console.error("Failed to generate label:", error.message);
    }
  }

  const itemsTableRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productSnapshot.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.productSnapshot.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.quantity * item.productSnapshot.price).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const mail = {
    email: process.env.PRIMARY_ADMIN_EMAIL,
    subject: `New Order Received - Order #${order._id}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">🎉 New Order Notification</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px;">
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Order Details</h2>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.orderedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #4CAF50; font-weight: bold;">PAID</span></p>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Customer Details</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A"}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email || "N/A"}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${user.phone || "N/A"}</p>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Shipping Address</h2>
            <p style="margin: 5px 0;"><strong>${shippingAddress.recipientName}</strong></p>
            <p style="margin: 5px 0;">${shippingAddress.addressDetails}</p>
            ${shippingAddress.landmark ? `<p style="margin: 5px 0;">Landmark: ${shippingAddress.landmark}</p>` : ""}
            <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zipCode}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${shippingAddress.phone}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; background-color: white;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTableRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Total Amount:</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #4CAF50;">₹${order.totalPrice.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          ${
            order.awbCode
              ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 5px; border-left: 4px solid #2196F3;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Shipping Details</h2>
            <p style="margin: 5px 0;"><strong>AWB Code:</strong> ${order.awbCode}</p>
            <p style="margin: 5px 0;"><strong>Courier Company:</strong> ${order.courierCompany}</p>
          </div>
          `
              : ""
          }

          ${
            labelUrl
              ? `
          <div style="text-align: center; margin-top: 30px;">
            <a href="${labelUrl}" target="_blank" style="display: inline-block; padding: 15px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">📄 Generate Label</a>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">This is an automated notification from Shobdodhara Prakashani</p>
          </div>
        </div>
      </div>
    `,
  };

  await emailQueue.add(SEND_ORDER_CONFIRMATION_JOB, mail);
};

const sendEnquiryEmail = async (name, phone, email, enquiry) => {
  const mail = {
    email: process.env.PRIMARY_ADMIN_EMAIL,
    subject: `New Enquiry From ${name}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">📧 New Contact Enquiry</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px;">
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Contact Details</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Enquiry</h2>
            <p style="margin: 5px 0; white-space: pre-wrap;">${enquiry}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">This is an automated notification from Shobdodhara Prakashani</p>
          </div>
        </div>
      </div>
    `,
  };

  await emailQueue.add(SEND_ENQUIRY_JOB, mail);
};

const sendJoinRequestEmail = async (name, phone, email, files) => {
  const attachments = files.map((file) => ({
    filename: file.originalname,
    content: file.buffer,
    contentType: file.mimetype,
  }));

  const mail = {
    email: process.env.PRIMARY_ADMIN_EMAIL,
    subject: `New Author Application From ${name}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">✍️ New Author Application</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px;">
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Applicant Details</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
          </div>

          ${
            files.length > 0
              ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 5px; border-left: 4px solid #2196F3;">
            <h2 style="margin: 0 0 10px 0; color: #333;">Attached Documents</h2>
            <p style="margin: 5px 0;"><strong>Total Files:</strong> ${files.length}</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${files.map((file) => `<li>${file.originalname} (${(file.size / 1024).toFixed(2)} KB)</li>`).join("")}
            </ul>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">This is an automated notification from Shobdodhara Prakashani</p>
          </div>
        </div>
      </div>
    `,
    attachments,
  };

  await emailQueue.add(SEND_JOIN_REQUEST_JOB, mail);
};

export { sendOrderConfirmationEmail, sendEnquiryEmail, sendJoinRequestEmail };
