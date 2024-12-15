  const mongoose = require('mongoose');
  const Joi = require('joi')

  const cartItemSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  });

  const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0
    }
  }, { timestamps: true });

  const Cart = mongoose.model('Carts', cartSchema);

  const cartValidation = {
    addToCart: Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    }),
    updateCart: Joi.object({
      quantity: Joi.number().min(1).required()
    })
  };

  module.exports = { Cart, cartValidation };
