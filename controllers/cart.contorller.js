const Cart = require('../models/cart.moduls');
const asyncWrapper = require('../models/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const appError = require('../utils/appError');

const getCart = asyncWrapper(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.currentUser._id });
  res.json({ status: httpStatusText.SUCCESS, data: { cart } });
});

const addToCart = asyncWrapper(async (req, res, next) => {
  const { productId, quantity, price } = req.body;
  
  let cart = await Cart.findOne({ userId: req.currentUser._id });
  
  if (!cart) {
    cart = new Cart({
      userId: req.currentUser._id,
      items: [{ productId, quantity, price }],
      totalAmount: quantity * price
    });
  } else {
    cart.items.push({ productId, quantity, price });
    cart.totalAmount += quantity * price;
  }
  
  await cart.save();
  res.status(201).json({ status: httpStatusText.SUCCESS, data: { cart } });
});

module.exports = {
    addToCart,
    getCart
  };
