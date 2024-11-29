const express = require("express");
const { validationSchema } = require("../middlewares/middlewareSchema");
const UsersController = require("../controllers/users.contorller");
const userRoles = require("../utils/usersRoles");
const allowedTo = require("../middlewares/allowedTo");
const multer = require('multer')





const {
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");

const validateObjectId = require("../middlewares/validateObjectId");






const upload = multer({ dest: 'uploads/' })


const router = express.Router();

// router
//   .route("/:userId")
//   .get(UsersController.getUser)
//   .put(validationSchema(), UsersController.editUser)
//   .delete(
//     verifyToken,
//     allowedTo(userRoles.ADMIN, userRoles.MODERATOR),
//     UsersController.deleteUser
//   );

router.route("/").get(verifyTokenAndAdmin, UsersController.getUsers);

router.route("/getUser/:id").get(validateObjectId, UsersController.getUser);

router.route("/editUser/:id").put(validateObjectId, verifyTokenAndOnlyUser, UsersController.editUser);

router.route("/deleteUser/:id").delete(validateObjectId, verifyTokenAndAuthorization,UsersController.deleteUser);

router.route("/count").get(verifyTokenAndAdmin, UsersController.getUsersCount);

// router.route("/login").post(UsersController.login);
// 
// router.route("/addUser").post(upload.single('avatar'), UsersController.addUser);
// 
// router.post('/like/:userId/:productId', UsersController.toggleLikeProduct);
// 
// router.get('/liked-products', verifyToken, UsersController.getLikedProducts);

module.exports = router;
