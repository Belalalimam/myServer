const express = require("express");
const { validationSchema } = require("../middlewares/middlewareSchema");
const UsersController = require("../controllers/users.contorller");
const verifyToken = require("../middlewares/verifyToken");
const userRoles = require("../utils/usersRoles");
const allowedTo = require("../middlewares/allowedTo");
const multer = require('multer')

const upload = multer({ dest: 'uploads/' })


const router = express.Router();

router
  .route("/:userId")
  .get(UsersController.getUser)
  .put(validationSchema(), UsersController.editUser)
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MODERATOR),
    UsersController.deleteUser
  );

router.route("/").get( UsersController.getUsers);

router.route("/getUser/:userId").get( UsersController.getUser);

router.route("/login").post(UsersController.login);

router.route("/addUser").post(upload.single('avatar'), UsersController.addUser);

router.post('/like/:userId/:productId', verifyToken, UsersController.toggleLikeProduct);

router.get('/liked-products', verifyToken, UsersController.getLikedProducts);

module.exports = router;
