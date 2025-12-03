import Cart from "../models/cartModel.js";

const fetchOrSaveActiveCart = async (userId) => {
  let cart = await Cart.findOne({ userId, status: "ACTIVE" });

  if (!cart) {
    cart = await Cart.create({ userId, status: "ACTIVE" });
  }

  return cart;
};

export { fetchOrSaveActiveCart };
