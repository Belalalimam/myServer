const express = require("express");
const productController = require("../controllers/products.contorller");
const photoUpload = require("../middlewares/photoUpload");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

const routerProduct = express.Router();
   
routerProduct.route("/newProduct").post(verifyToken, verifyTokenAndAdmin, photoUpload.single("productImage"), productController.newProduct);

routerProduct.route("/").get(productController.getProducts);

routerProduct.route("/getProduct/:id").get(validateObjectId, productController.getProduct);

routerProduct.route("/deleteProduct/:id").delete(validateObjectId, verifyToken, productController.deleteProduct);

routerProduct.route("/updateProduct/:id").put(validateObjectId, verifyToken, photoUpload.single("productImage"), productController.updateProduct);

routerProduct.route("/upload-image/:id").put(validateObjectId, verifyToken, photoUpload.single("productImage"), productController.updateProductImage);

routerProduct.route("/Cart/:id").put(validateObjectId, verifyToken, productController.AddToCart);

routerProduct.route("/like/:id").put(validateObjectId, verifyToken, productController.toggleLike);

routerProduct.route("/count").get(productController.getProductsCount);




module.exports = routerProduct;
 