const express = require("express");
const authController = require("../controllers/auth.contorller")
const passport = require("passport");

const authRouter = express.Router()

authRouter.route("/register").post(authController.registerUserCtrl);

authRouter.route("/login").post(authController.loginUserCtrl);

authRouter.route("/google").get(passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.route("/google/callback").get(passport.authenticate("google", { failureRedirect: "https://royal-tex.shutterfly-alu.com/login" }),authController.googleCallbackCtrl);

authRouter.route("/:userId/verify/:token").get(authController.verifyUserAccountCtrl);

module.exports = authRouter;

    