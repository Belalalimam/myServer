const mongoose = require("mongoose");
const Joi = require("joi");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Carts = mongoose.model("Carts", cartSchema);


function addToCartValidate(obj) {
  const schema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
  })
  return schema.validate(obj);
}
function updateCartValidate(obj) {
  const schema = Joi.object({
    quantity: Joi.number().min(1).required(),
  })
  return schema.validate(obj);
}

module.exports = { 
  Carts, 
  addToCartValidate,
  updateCartValidate
}
