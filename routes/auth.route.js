const express = require("express");
const authController = require("../controllers/auth.contorller")

const authRouter = express.Router()

authRouter.route("/register").post(authController.registerUserCtrl);

authRouter.route("/login").post(authController.loginUserCtrl);

authRouter.route("/:userId/verify/:token").get(authController.verifyUserAccountCtrl);

module.exports = authRouter;