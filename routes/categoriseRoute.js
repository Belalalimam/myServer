const router = require("express").Router();
const CateController  = require("../controllers/categories.contorller");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/categories
router
  .route("/")
  .post(verifyTokenAndAdmin, CateController.createCategoryCtrl)
  .get(CateController.getAllCategoriesCtrl);

// /api/categories/:id
router
  .route("/:id")
  .delete(validateObjectId, verifyTokenAndAdmin, CateController.deleteCategoryCtrl);

module.exports = router;