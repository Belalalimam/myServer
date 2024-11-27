const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const CartController = require('../controllers/cart.contorller');

router.use(verifyToken); // Protect all cart routes

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
// router.put('/update/:itemId', updateCartItem);
// router.delete('/remove/:itemId', removeFromCart);

module.exports = router;
