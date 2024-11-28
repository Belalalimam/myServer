const { validationResult } = require("express-validator");
const Users = require("../models/users.moduls");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../models/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");

 

const getUsers = asyncWrapper(async (req, res) => {

  console.log("🚀 ~ verifyTokn ~ token:", req.headers)
  const query = req.query;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  console.log("🚀 ~ getUsers ~ query:", query);
  const users = await Users.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { users } });
  console.log("🚀 ~ app.get ~ allUsers:");
});

const getUser = asyncWrapper(async (req, res, next) => {
  const user = await Users.findById(req.params.userId);
  if (!user) {
    const error = appError.create(
      "the user not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { user } });
});

const editUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.userId;
  const err = validationResult(req);

  const updatedUser = await Users.updateOne(
    { _id: userId },
    { $set: { ...req.body } }
  );
  if (!err.isEmpty()) {
    const error = appError.create(err.array(), 400, httpStatusText.FAIL);
    return next(error);
  }
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { updatedUser } });
});

const addUser = asyncWrapper(async (req, res, next) => {
  console.log("Request body:", req.body);
  const { name, age, email, password, role, avatar } = req.body;

  const oldUser = await Users.findOne({ email: email });

  if (oldUser) {
    const error = appError.create(
      "email already exist",
      400,
      httpStatusText.FAIL 
    );

    return next(error);
  }

  const hashedPassword = await bcrypt.hashSync(password, 10);

  const newUser = new Users({
    name,
    age, 
    email,
    role,
    avatar: req.file ? req.file.filename : "uploads/mypng.jpg",
    password: hashedPassword,
  });


    const token = await generateJWT({email: newUser.email, id: newUser._id, role: newUser.role})

    newUser.token = token

  await newUser.save();


  res.status(201).json({ status: httpStatusText.SUCCESS, data: { newUser } });
});

const deleteUser = asyncWrapper(async (req, res) => {
  await Users.deleteOne({ _id: req.params.userId });
  res.json({ status: httpStatusText.SUCCESS, data: null });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password,  role, name, age } = req.body;


  const user = await Users.findOne({ email: email });
  if (!user) {
    const error = appError.create(
      "Invalid email or password",
      401,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const error = appError.create(
      "Invalid email or password",
      401,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const token = await generateJWT({
    email: user.email, 
    id: user._id,  
    role: user.role
  });

  user.token = token;
  await user.save();
  
  res.json({ 
    status: httpStatusText.SUCCESS, 
    data: { 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        likedProducts: user.likedProducts,
        token: token
      } 
    } 
  });

  console.log("🚀 ~ login ~ token:", token)
});


// const toggleLikeProduct = asyncWrapper(async (req, res, next) => {
//   const userId = req.currentUser.id;
//   const productId = req.params.productId;
  
//   const user = await Users.findById(userId);
  
//   const isProductLiked = user.likedProducts.includes(productId);
  
//   if (isProductLiked) {
//     user.likedProducts = user.likedProducts.filter(id => id.toString() !== productId);
//   } else {
//     user.likedProducts.push(productId);
//   }
  
//   await user.save();
  
//   res.json({ 
//     status: httpStatusText.SUCCESS, 
//     data: { likedProducts: user.likedProducts } 
//   });
// });


// In your user controller
// const toggleLikeProduct = async (req, res) => {
//   const { userId, productId } = req.params;
  
//   const updatedUser = await Users.findByIdAndUpdate(
//     userId,
//     { $push: { likedProducts: productId } },
//     { new: true }
//   );
  
//   res.json({ success: true, data: updatedUser });
// };

const toggleLikeProduct = async (req, res, next) => {
  try {
      const { userId, productId } = req.params;
      
      // Verify the authenticated user matches the userId
      if (req.currentUser.userId !== userId) {
          return next(appError.create('Unauthorized action', 401, httpStatusText.FAIL));
      }

      const user = await User.findById(userId);
      
      if (!user) {
          return next(appError.create('User not found', 404, httpStatusText.FAIL));
      }

      // Initialize likedProducts array if it doesn't exist
      if (!user.likedProducts) {
          user.likedProducts = [];
      }

      // Toggle the like status
      const productIndex = user.likedProducts.indexOf(productId);
      if (productIndex === -1) {
          // Add product to likes
          user.likedProducts.push(productId);
      } else {
          // Remove product from likes
          user.likedProducts.splice(productIndex, 1);
      }

      await user.save();

      res.status(200).json({
          status: httpStatusText.SUCCESS,
          data: {
              likedProducts: user.likedProducts
          }
      });
  } catch (error) {
      next(error);
  }
};


const getLikedProducts = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id;
  
  const user = await Users.findById(userId)
    .populate('likedProducts');
    
  res.json({
    status: httpStatusText.SUCCESS,
    data: { likedProducts: user.likedProducts }
  });
});


module.exports = {
  getUsers,
  getUser,
  editUser,
  addUser,
  deleteUser,
  login,
  getLikedProducts,
  toggleLikeProduct,
};
