import AppLogger from "../utils/logger.js";
import Order from "../models/orderModel.js";
import { schedulePickup } from "../services/shiprocketServices.js";

const processDelayedPickups = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ordersToSchedule = await Order.find({
      pickupScheduled: false,
      awbCode: { $exists: true, $ne: null },
      shiprocketShipmentId: { $exists: true, $ne: null },
      orderedAt: { $lte: twentyFourHoursAgo },
    });

    AppLogger.info(
      `Found ${ordersToSchedule.length} orders ready for pickup scheduling`,
    );

    for (const order of ordersToSchedule) {
      try {
        await schedulePickup(order._id, order.shiprocketShipmentId);
        await Order.findByIdAndUpdate(order._id, {
          pickupScheduled: true,
          pickupScheduledAt: new Date(),
        });

        AppLogger.info(`Pickup scheduled for order ${order._id}`);
      } catch (error) {
        AppLogger.error(
          `Failed to schedule pickup for order ${order._id}:`,
          error.message,
        );
      }
    }

    return {
      success: true,
      message: `Total ${ordersToSchedule.length} order(s) scheduled`,
    };
  } catch (error) {
    AppLogger.error("Error in processDelayedPickups:", error.message);
    throw error;
  }
};

export default processDelayedPickups;
