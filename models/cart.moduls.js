const mongoose = require("mongoose");
const validator = require("validator");
const userRoles = require("../utils/usersRoles");

const usersSchema = new mongoose.Schema({
  userId: {
    type: String,
    // require: true
  },
  productId: {
    type: String,
    // require: true
  },
  items: [
    {
      productId: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Carts", usersSchema);
