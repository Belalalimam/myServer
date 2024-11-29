const mongoose = require("mongoose");
const validator = require("validator");
const userRoles = require("../utils/usersRoles");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // require: true
    },
    age: {
      type: Number,
      // require: true
    },
    email: {
      type: String,
      require: true,
      unique: true,
      validate: [validator.isEmail, "lease enter a valid email"],
    },
    password: {
      type: String,
      require: true,
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      enum: [userRoles.ADMIN, userRoles.USER, userRoles.MODERATOR],
      default: userRoles.USER,
    },
    avatar: {
      type: String,
      // default: 'uploads/mypng.jpg'
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Posts That Belongs To This User When he/she Get his/her Profile
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET_KEY
  );
};

const Users = mongoose.model("Users", UserSchema);

// Validate Register User
function validateRegisterUser(obj) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}

// Validate Login User
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

// Validate Update User
function validateUpdateUser(obj) {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    password: passwordComplexity(),
    bio: Joi.string(),
  });
  return schema.validate(obj);
}

// Validate Email
function validateEmail(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
  });
  return schema.validate(obj);
}

// Validate New Password
function validateNewPassword(obj) {
  const schema = Joi.object({
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  Users,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
  validateEmail,
  validateNewPassword,
};
