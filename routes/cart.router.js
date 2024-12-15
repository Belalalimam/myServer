// const express = require("express");
// const cartController = require('../controllers/cart.contorller');
// const {verifyToken} = require('../middlewares/verifyToken');

// const router = express.Router();

// router.route('/').post(verifyToken, cartController.addToCart);
// router.route('/').get(verifyToken, cartController.getCart);
// router.route('/:productId').put(verifyToken, cartController.updateCartItem);
// router.route('/:productId').delete(verifyToken, cartController.removeFromCart);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');
const { addToCart, getCart, updateCartItem, removeFromCart } = require('../controllers/cart.contorller');

router.post('/', verifyToken, addToCart);
router.get('/', verifyToken, getCart);
router.put('/:productId', verifyToken, updateCartItem);
router.delete('/:productId', verifyToken, removeFromCart);

module.exports = router;
