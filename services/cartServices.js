import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Product from "../models/productModel.js";

const fetchOrSaveActiveCart = async (userId) => {
  let cart = await Cart.findOne({ userId, status: "ACTIVE" });

  if (!cart) {
    cart = await Cart.create({ userId, status: "ACTIVE" });
  } else {
    // refresh updatedAt because user accessed the cart
    cart = await Cart.findByIdAndUpdate(
      cart._id,
      { updatedAt: new Date() },
      { new: true, timestamps: false }
    ).select("-__v");
  }

  return cart;
};

const fetchCartItems = async (userId) => {
  const cart = await fetchOrSaveActiveCart(userId);
  // const cartItems = await CartItem.find({ cartId: cart._id }).populate(
  //   "productId"
  // );
  const cartItems = await CartItem.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $match: { cartId: cart._id } },
    {
      $project: {
        __v: 0,
        product: {
          _id: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    },
  ]);

  return cartItems;
};

const saveCartItem = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const cart = await fetchOrSaveActiveCart(userId);
  const effectivePrice = product.discountPrice || product.price;
  const totalPrice = quantity * effectivePrice;
  const existingCartItem = await CartItem.findOne({
    cartId: cart._id,
    productId,
  });

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;
    const newTotalPrice = newQuantity * effectivePrice;

    return await CartItem.findByIdAndUpdate(
      existingCartItem._id,
      {
        quantity: newQuantity,
        totalPrice: newTotalPrice,
        productSnapshot: {
          title: product.title,
          image: product.bannerImage,
          price: effectivePrice,
        },
      },
      { new: true }
    );
  }

  return await CartItem.create({
    cartId: cart._id,
    productId,
    quantity,
    totalPrice,
    productSnapshot: {
      title: product.title,
      image: product.bannerImage,
      price: effectivePrice,
    },
  });
};

const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const cart = await fetchOrSaveActiveCart(userId);
  const cartItem = await CartItem.findOne({ _id: itemId, cartId: cart._id });

  if (!cartItem) {
    throw new Error("Cart item not found.");
  }

  const totalPrice = quantity * cartItem.productSnapshot.price;

  return await CartItem.findByIdAndUpdate(
    itemId,
    { quantity, totalPrice },
    { new: true }
  );
};

const removeCartItem = async (userId, itemId) => {
  const cart = await fetchOrSaveActiveCart(userId);
  const removedCartItem = await CartItem.findOneAndDelete({
    _id: itemId,
    cartId: cart._id,
  });

  if (!removedCartItem) {
    throw new Error("Cart item not found.");
  }

  return removedCartItem;
};

const clearCartItems = async (userId) => {
  const cart = await fetchOrSaveActiveCart(userId);

  return await CartItem.deleteMany({ cartId: cart._id });
};

const refreshCartItems = async (userId) => {
  const cart = await fetchOrSaveActiveCart(userId);
  const cartItems = await CartItem.find({ cartId: cart._id });
  const updatedItems = [];
  const unchangedItems = [];
  const outOfStockItems = [];

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId);

    if (!product || !product.isActive || product.stock === 0) {
      outOfStockItems.push(cartItem);
      continue;
    }

    const newEffectivePrice = product.discountPrice || product.price;
    const oldPrice = cartItem.productSnapshot.price;
    const priceChanged = newEffectivePrice !== oldPrice;
    const titleChanged = product.title !== cartItem.productSnapshot.title;
    const imageChanged = product.bannerImage !== cartItem.productSnapshot.image;

    if (priceChanged || titleChanged || imageChanged) {
      const newTotalPrice = cartItem.quantity * newEffectivePrice;

      await CartItem.findByIdAndUpdate(cartItem._id, {
        productSnapshot: {
          title: product.title,
          image: product.bannerImage,
          price: newEffectivePrice,
        },
        totalPrice: newTotalPrice,
      });

      updatedItems.push({
        ...cartItem.toObject(),
        priceChanged,
        oldPrice,
        newPrice: newEffectivePrice,
      });
    } else {
      unchangedItems.push(cartItem);
    }
  }

  return { updatedItems, unchangedItems, outOfStockItems };
};

const markInactiveCartsAsAbandoned = async () => {
  const THRESHOLD = process.env.CART_ABANDON_THRESHOLD_MIN * 60 * 1000;
  const cutoffDate = new Date(Date.now() - THRESHOLD);

  const result = await Cart.updateMany(
    { status: "ACTIVE", updatedAt: { $lt: cutoffDate } },
    { $set: { status: "ABANDONED", updatedAt: new Date() } }
  );

  console.log("All inactive carts got abandoned:", result);
};

export {
  fetchOrSaveActiveCart,
  fetchCartItems,
  saveCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartItems,
  refreshCartItems,
  markInactiveCartsAsAbandoned,
};
