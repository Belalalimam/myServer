const mongoose = require("mongoose");
const validator = require("validator");
const userRoles = require("../utils/usersRoles");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    require: true,
  },
  productTitle: {
    type: String,
    require: true,
  },
  productImage: {
    type: String,
    // require: true,
    default: '/uploads/hhhhh.jpeg'
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
});

module.exports = mongoose.model("Products", productSchema);
