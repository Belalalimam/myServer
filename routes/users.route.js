const express = require("express");
const UsersController = require("../controllers/users.contorller")
const {verifyTokenAndAdmin,verifyTokenAndOnlyUser,verifyToken,verifyTokenAndAuthorization} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const passport = require("passport");

const router = express.Router();

router.route("/").get(verifyTokenAndAdmin, UsersController.getUsers);

router.route("/Profile/:id").get(validateObjectId, UsersController.Profile);

router.route("/editUser/:id").put(validateObjectId, verifyTokenAndOnlyUser, UsersController.editUser);

router.route("/deleteUser/:id").delete(validateObjectId, verifyTokenAndAuthorization,UsersController.deleteUser);

router.route("/count").get(verifyTokenAndAdmin, UsersController.getUsersCount);

module.exports = router;
