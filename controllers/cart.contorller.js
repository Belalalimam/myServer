const { Cart, cartValidation } = require("../models/cart.modal");
const asyncWrapper = require("../models/asyncWrapper");

// إضافة منتج للسلة
const addToCart = asyncWrapper(async (req, res) => {
  try {
    console.log("Auth header:", req.headers.authorization);
    console.log("User data:", req.user);
    const { error } = cartValidation.addToCart.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [
          {
            productId: req.body.productId,
            quantity: req.body.quantity,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === req.body.productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += req.body.quantity;
      } else {
        cart.items.push({
          productId: req.body.productId,
          quantity: req.body.quantity,
        });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// الحصول على سلة المستخدم
const getCart = asyncWrapper(async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );
    res.status(200).json(cart || { items: [], totalAmount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// تحديث كمية منتج في السلة
const updateCartItem = asyncWrapper(async (req, res) => {
  try {
    const { error } = cartValidation.updateCart.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === req.params.productId
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: "Product not found in cart" });

    cart.items[itemIndex].quantity = req.body.quantity;
    
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// حذف منتج من السلة
const removeFromCart = asyncWrapper(async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );
   
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
};
