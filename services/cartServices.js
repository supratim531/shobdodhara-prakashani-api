import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Product from "../models/productModel.js";

const fetchOrSaveActiveCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, status: "ACTIVE" });
  } else if (cart.status === "ACTIVE") {
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
  const existingCartItem = await CartItem.findOne({
    cartId: cart._id,
    productId,
  });
  const insufficientStockMessage = `
    This website has only ${product.stock} of these item available. To get more contact to admin
  `;

  if (existingCartItem) {
    const requestedTotalQuantity = existingCartItem.quantity + quantity;
    const stockReduced = product.stock < requestedTotalQuantity;
    const newQuantity = stockReduced ? product.stock : requestedTotalQuantity;
    const newTotalPrice = newQuantity * effectivePrice;

    const updatedCartItem = await CartItem.findByIdAndUpdate(
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

    const notification = {
      isTrue: stockReduced,
      message: stockReduced ? insufficientStockMessage : null,
    };

    return { item: updatedCartItem, notification };
  } else {
    const stockReduced = product.stock < quantity;
    quantity = stockReduced ? product.stock : quantity;
    const totalPrice = quantity * effectivePrice;

    const createdCartItem = await CartItem.create({
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

    const notification = {
      isTrue: stockReduced,
      message: stockReduced ? insufficientStockMessage : null,
    };

    return { item: createdCartItem, notification };
  }
};

const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const cart = await fetchOrSaveActiveCart(userId);
  const cartItem = await CartItem.findOne({ _id: itemId, cartId: cart._id });
  const product = await Product.findById(cartItem.productId);

  if (!cartItem) {
    throw new Error("Cart item not found.");
  }

  if (!product) {
    throw new Error("Product not found.");
  }

  const effectivePrice = product.discountPrice || product.price;
  const stockReduced = product.stock < quantity;
  const newQuantity = stockReduced ? product.stock : quantity;
  const newTotalPrice = newQuantity * effectivePrice;

  const updatedCartItem = await CartItem.findByIdAndUpdate(
    itemId,
    {
      quantity: newQuantity,
      totalPrice: newTotalPrice,
    },
    { new: true }
  );

  const notification = {
    isTrue: stockReduced,
    message: stockReduced
      ? `This website has only ${product.stock} of these item available. To get more contact to admin`
      : null,
  };

  return { item: updatedCartItem, notification };
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
  const deletedItems = [];
  const unchangedItems = [];
  const outOfStockItems = [];

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId);

    // If product deleted or inactive → remove item
    if (!product || !product.isActive) {
      await CartItem.deleteOne({ productId: cartItem.productId });
      deletedItems.push(cartItem);
      continue;
    }

    if (product.stock <= 0) {
      outOfStockItems.push(cartItem);
      continue;
    }

    const newEffectivePrice = product.discountPrice || product.price;
    const oldPrice = cartItem.productSnapshot.price;
    const priceChanged = newEffectivePrice !== oldPrice;
    const stockReduced = product.stock < cartItem.quantity;
    const titleChanged = product.title !== cartItem.productSnapshot.title;
    const imageChanged = product.bannerImage !== cartItem.productSnapshot.image;

    if (priceChanged || stockReduced || titleChanged || imageChanged) {
      const newQuantity = stockReduced ? product.stock : cartItem.quantity;
      const newTotalPrice = newQuantity * newEffectivePrice;

      await CartItem.findByIdAndUpdate(cartItem._id, {
        productSnapshot: {
          title: product.title,
          image: product.bannerImage,
          price: newEffectivePrice,
        },
        quantity: newQuantity,
        totalPrice: newTotalPrice,
      });

      updatedItems.push({
        ...cartItem.toObject(),
        priceChanged,
        oldPrice,
        newPrice: newEffectivePrice,
        stockReduced,
        oldQuantity: cartItem.quantity,
        newQuantity,
      });
    } else {
      unchangedItems.push(cartItem);
    }
  }

  return { unchangedItems, updatedItems, outOfStockItems, deletedItems };
};

const reactivateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return await fetchOrSaveActiveCart(userId);
  } else if (cart.status === "ACTIVE") {
    return cart;
  }

  cart = await Cart.findByIdAndUpdate(
    cart._id,
    { status: "ACTIVE" },
    { new: true }
  ).select("-__v");

  const { unchangedItems, updatedItems, outOfStockItems, deletedItems } =
    await refreshCartItems(userId);

  return {
    item: cart,
    unchangedItems,
    updatedItems,
    outOfStockItems,
    deletedItems,
  };
};

const fetchInactiveCarts = async () => {
  const THRESHOLD = process.env.CART_INACTIVITY_THRESHOLD_MIN * 60 * 1000;
  const cutoffDate = new Date(Date.now() - THRESHOLD);

  return await Cart.find({
    status: "ACTIVE",
    updatedAt: { $lt: cutoffDate },
  }).lean();
};

const markCartsAsAbandoned = async (cartIds) => {
  return await Cart.updateMany(
    { _id: { $in: cartIds } },
    { $set: { status: "ABANDONED", updatedAt: new Date() } }
  );
};

export {
  fetchOrSaveActiveCart,
  fetchCartItems,
  saveCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartItems,
  refreshCartItems,
  reactivateCart,
  fetchInactiveCarts,
  markCartsAsAbandoned,
};
