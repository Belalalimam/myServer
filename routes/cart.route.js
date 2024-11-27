const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

router.use(verifyToken); // Protect all cart routes

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update/:itemId', updateCartItem);
router.delete('/remove/:itemId', removeFromCart);

module.exports = router;
