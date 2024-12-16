const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');
const { addToCart, getCart, updateCartItem, removeFromCart } = require('../controllers/cart.contorller');

router.route('/:productId').post(verifyToken, addToCart);
router.route('/').get(verifyToken, getCart);
router.route('/:productId').put( verifyToken, updateCartItem);
router.route('/:productId').delete(verifyToken, removeFromCart);

module.exports = router;
 