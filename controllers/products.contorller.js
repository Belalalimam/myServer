// const { validationResult } = require("express-validator");
// const Products = require("../models/product.moduls");
// const httpStatusText = require("../utils/httpStatusText");
// const asyncWrapper = require("../models/asyncWrapper");
// const appError = require("../utils/appError");
// const bcrypt = require("bcryptjs");
// const generateJWT = require("../utils/generateJWT");

// const getProducts = asyncWrapper(async (req, res) => {
//   const query = req.query;

//   const limit = query.limit || 10;
//   const page = query.page || 1;
//   const skip = (page - 1) * limit;

//   const products = await Products.find({}, { __v: false })
//     .limit(limit)
//     .skip(skip);
//   res.json({ status: httpStatusText.SUCCESS, data: { products } });
// });

// const getProduct = asyncWrapper(async (req, res, next) => {
//   const product = await Products.findById(req.params.productId);
//   if (!product) {
//     const error = appError.create(
//       "the user not found",
//       404,
//       httpStatusText.FAIL
//     );
//     return next(error);
//   }
//   return res.json({ status: httpStatusText.SUCCESS, data: { product } });
// });

// const editProduct = asyncWrapper(async (req, res, next) => {
//   const userId = req.params.userId;
//   const err = validationResult(req);

//   const updatedProduct = await Products.updateOne(
//     { _id: userId },
//     { $set: { ...req.body } }
//   );
//   if (!err.isEmpty()) {
//     const error = appError.create(err.array(), 400, httpStatusText.FAIL);
//     return next(error);
//   }
//   res
//     .status(200)
//     .json({ status: httpStatusText.SUCCESS, data: { updatedProduct } });
// });

// const addProduct = asyncWrapper(async (req, res, next) => {
//   const {
//     productName,
//     productTitle,
//     productImage,
//     productCategory,
//     productDescription,
//     productCategorySize,
//     productColor,
//     user,
//   } = req.body;

//   const Product = await Products.create({
//     productName,
//     productTitle,
//     productDescription,
//     productCategory,
//     productImage,
//     productColor,
//     productCategorySize,
//   });

//   const loggedInUser = req;
//   console.log(loggedInUser);

//   res.status(201).json({ status: httpStatusText.SUCCESS, data: { Product } });
// });

// const deleteProduct = asyncWrapper(async (req, res) => {
//   await Users.deleteOne({ _id: req.params.userId });
//   res.json({ status: httpStatusText.SUCCESS, data: null });
// });

// const toggleLikeCtrl = asyncWrapper(async (req, res) => {

//   const { id: productId } = req.params;
//   console.log("🚀 ~ toggleLikeCtrl ~ productId:", productId)

//   let product = await Products.findById(productId);
//   if (!product) {
//     return res.status(404).json({ message: "post not found" });
//   }

//   if (isPostAlreadyLiked) {
//     product = await Products.findByIdAndUpdate(
//       productId,
//       {
//         $pull: { likes },
//       },
//       { new: true }
//     );
//   } else {
//     product = await Products.findByIdAndUpdate(
//       productId,
//       {
//         $push: { likes },
//       },
//       { new: true }
//     );
//   }
//   res.status(200).json(product);
// });







const fs = require("fs");
const path = require("path");
const asyncWrapper = require("../models/asyncWrapper");
const {
  Products,
  validateCreateProduct,
  validateUpdateProduct,
} = require("../models/product.moduls");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");


/**-----------------------------------------------
 * @desc    Create New product
 * @route   /products/newProduct
 * @method  POST
 * @access  private (only logged in user)
 ------------------------------------------------*/
 const newProduct = asyncWrapper(async (req, res) => {
  // 1. Validation for image
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  // 2. Validation for data
  const { error } = validateCreateProduct(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 3. Upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 4. Create new post and save it to DB
  const newProduct = await Products.create({
    productName: req.body.productName,
    productDescription: req.body.productDescription,
    productCategory: req.body.productCategory,
    user: req.user.id,
    productImage: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // 5. Send response to the client
  res.status(201).json(newProduct);

  // 6. Remove image from the server
  fs.unlinkSync(imagePath);
});

/**-----------------------------------------------
 * @desc    Get All Products
 * @route   /Products
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 const getProducts = asyncWrapper(async (req, res) => {
  const POST_PER_PAGE = 10;
  const { pageNumber, category } = req.query;
  let Product;

  if (pageNumber) {
    Product = await Products.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    Product = await Products.find({ category }) 
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    Product = await Products.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(Product
    
  );
});

/**-----------------------------------------------
 * @desc    Get Single Product
 * @route   /Products/getProduct/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 const getProduct = asyncWrapper(async (req, res) => {
  const post = await Products.findById(req.params.id)
  .populate("user", ["-password"])
  
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  res.status(200).json(post);
});

/**-----------------------------------------------
 * @desc    Get Products Count
 * @route   /Products/count
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 const getProductsCount = asyncWrapper(async (req, res) => {
  const count = await Products.countDocuments();
  res.status(200).json(count);
});
  

/**-----------------------------------------------
 * @desc    Delete Post
 * @route   /Products/deleteProduct/:id
 * @method  DELETE
 * @access  private (only admin or owner of the post)
 ------------------------------------------------*/
 const deleteProduct = asyncWrapper(async (req, res) => {
  const product = await Products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "post not found" });
  }

  if (req.user.isAdmin || req.user.id === product.user.toString()) {
    await Products.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(product.productImage.publicId);

    res.status(200).json({
      message: "post has been deleted successfully",
      postId: product._id,
    });
  } else {
    res.status(403).json({ message: "access denied, forbidden" });
  }
});

/**-----------------------------------------------
 * @desc    Update Product
 * @route   /Products/updateProduct/:id
 * @method  PUT
 * @access  private (only owner of the post)
 ------------------------------------------------*/
const updateProduct = asyncWrapper(async (req, res) => {
  // 1. Validation
  const { error } = validateUpdateProduct(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Get the post from DB and check if post exist
  const product = await Products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "post not found" });
  }

  // 3. check if this post belong to logged in user
  if (req.user.id !== product.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // 4. Update post
  const updatedPost = await Products.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        productName: req.body.productName,
        productDescription: req.body.productDescription,
        productCategory: req.body.productCategory,
      },
    },
    { new: true }
  ).populate("user", ["-password"])

  // 5. Send response to the client
  res.status(200).json(updatedPost);
});


/**-----------------------------------------------
 * @desc    Update Product Image
 * @route   /Products/upload-image/:id
 * @method  PUT
 * @access  private (only owner of the post)
 ------------------------------------------------*/
 const updateProductImage = asyncWrapper(async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  // 2. Get the post from DB and check if post exist
  const product = await Products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "post not found" });
  }

  // 3. Check if this post belong to logged in user
  if (req.user.id !== product.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // 4. Delete the old image
  await cloudinaryRemoveImage(product.productImage.publicId);

  // 5. Upload new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 6. Update the image field in the db
  const updatedProduct = await Products.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        productImage: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // 7. Send response to client
  res.status(200).json(updatedProduct);

  // 8. Remvoe image from the server
  fs.unlinkSync(imagePath);
});


/**-----------------------------------------------
 * @desc    Toggle Like
 * @route   /Products/like/:id
 * @method  PUT
 * @access  private (only logged in user)
 ------------------------------------------------*/
const toggleLike = asyncWrapper(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: productId } = req.params;

  let product = await Products.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "post not found" });
  }

  const isPostAlreadyLiked = product.likes.find(
    (user) => user.toString() === loggedInUser
  );

  if (isPostAlreadyLiked) {
    product = await Products.findByIdAndUpdate(
      productId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    product = await Products.findByIdAndUpdate(
      productId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }

  res.status(200).json(product);
});


module.exports = {
  newProduct,
  getProducts,
  getProduct,
  getProductsCount,
  deleteProduct,
  updateProduct,
  updateProductImage,
  toggleLike
  
};
