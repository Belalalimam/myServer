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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
//   likedProducts: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Products",
//     },
//   ],
});

module.exports = mongoose.model("Likes", usersSchema);
