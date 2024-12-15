const mongoose = require("mongoose");
const Joi = require("joi");

const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      require: true,
    },
    productTitle: {
      type: String,
      require: true,
    },
    productCategory: {
      type: String,
      require: true,
    },
    productDescription: {
      type: String,
    },
    productCategorySize: {
      type: String,
    },
    productColor: {
      type: String,
    },
    productImage: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Post Model
const Products = mongoose.model("Products", ProductSchema);

function validateCreateProduct(obj) {
  const schema = Joi.object({
    productName: Joi.string().trim().min(2).max(200).required(),
    productDescription: Joi.string().trim().min(10).required(),
    productCategory: Joi.string().trim().required(),
    productCategorySize: Joi.string().trim().required(),
    productColor: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// Validate Update Post
// Validate Update Post
function validateUpdateProduct(obj) {
  const schema = Joi.object({
    productName: Joi.string().trim().min(2).max(200),
    productDescription: Joi.string().trim().min(10),
    productCategory: Joi.string().trim(),
    productCategorySize: Joi.string().trim().required(),
    productColor: Joi.string().trim().required(),
    productImage: Joi.string().trim(),
  });
  return schema.validate(obj);
}

module.exports = {
  Products,
  validateCreateProduct,
  validateUpdateProduct,
};
