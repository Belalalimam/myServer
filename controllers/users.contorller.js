const { validationResult } = require("express-validator");
const Users = require("../models/users.moduls");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../models/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcrypt");
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

module.exports = {
  getUsers,
  getUser,
  editUser,
  addUser,
  deleteUser,
  login,
};
