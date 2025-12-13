import pLimit from "p-limit";
import Product from "../models/productModel.js";
import Reservation from "../models/reservationModel.js";

const limit = pLimit(10); // process max 10 reservations at a time

const processExpiredReservations = async () => {
  const expiredReservations = await Reservation.find({
    expiresAt: { $lte: new Date() },
  });

  if (!expiredReservations.length) return;

  const tasks = expiredReservations.map((reservation) =>
    limit(async () => {
      // Restore stock to product
      await Product.findByIdAndUpdate(reservation.productId, {
        $inc: { stock: reservation.quantity },
      });
      // Remove expired reservation
      await Reservation.findByIdAndDelete(reservation._id);
    })
  );
  await Promise.all(tasks);
  console.log(
    `----- ${expiredReservations.length} expired reservation(s) processed -----`
  );
};

export default processExpiredReservations;
