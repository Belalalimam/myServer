const { validationResult } = require("express-validator");
const Products = require("../models/product.moduls");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../models/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcrypt");
const generateJWT = require("../utils/generateJWT");

const getProducts = asyncWrapper(async (req, res) => {
  console.log("🚀 ~ verifyTokn ~ token:", req.params);
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  console.log("🚀 ~ getUsers ~ query:", query);
  const products = await Products.find({}, { __v: false })
    .limit(limit)
    .skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { products } });
  console.log("🚀 ~ app.get ~ allUsers:");
});

const getProduct = asyncWrapper(async (req, res, next) => {
  const product = await Products.findById(req.params.productId);
  if (!product) {
    const error = appError.create(
      "the user not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { product } });
});

const editProduct = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  const err = validationResult(req);

  const updatedProduct = await Products.updateOne(
    { _id: userId },
    { $set: { ...req.body } }
  );
  if (!err.isEmpty()) {
    const error = appError.create(err.array(), 400, httpStatusText.FAIL);
    return next(error);
  }
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { updatedProduct } });
});

const addProduct = asyncWrapper(async (req, res, next) => {
  const {
    productName,
    productTitle,
    productImage,
    productCategory,
    productDescription,
    productCategorySize,
    productColor,
  } = req.body;

  // const oldProduct = await Products.findOne({ productName });

  // if (oldProduct) {
  //   const error = appError.create(
  //     "product already exist",
  //     400,
  //     httpStatusText.FAIL
  //   );

  //   return next(error);
  // }

  const newProduct = new Products({
    productName,
    productTitle,
    productImage: req.file.filename,
    productCategory,
    productDescription,
    productCategorySize,
    productColor,
  });

  await newProduct.save();

  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { newProduct } });
});

const deleteProduct = asyncWrapper(async (req, res) => {
  await Users.deleteOne({ _id: req.params.userId });
  res.json({ status: httpStatusText.SUCCESS, data: null });
});

// const login = asyncWrapper(async (req, res, next) => {
//   const { email, password, role, name, age } = req.body;

//   const user = await Users.findOne({ email: email });
//   if (!user) {
//     const error = appError.create(
//       "Invalid email or password",
//       401,
//       httpStatusText.FAIL
//     );
//     return next(error);
//   }
//   const isValidPassword = await bcrypt.compare(password, user.password);
//   if (!isValidPassword) {
//     const error = appError.create(
//       "Invalid email or password",
//       401,
//       httpStatusText.FAIL
//     );
//     return next(error);
//   }
//   const token = await generateJWT({
//     email: user.email,
//     id: user._id,
//     role: user.role,
//   });

//   res.json({ status: httpStatusText.SUCCESS, data: { user } });

//   console.log("🚀 ~ login ~ token:", token);
// });

module.exports = {
  getProducts,
  getProduct,
  editProduct,
  addProduct,
  deleteProduct,
  // Login,
};
