const express = require("express");
const authController = require("../controllers/auth.contorller")

const authRouter = express.Router()


// /api/auth/register
authRouter.route("/register").post(authController.registerUserCtrl);

// /api/auth/login
authRouter.route("/login").post(authController.loginUserCtrl);

// /api/auth/:userId/verify/:token
authRouter.route("/:userId/verify/:token").get(authController.verifyUserAccountCtrl);

module.exports = authRouter;