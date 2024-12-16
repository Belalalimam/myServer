const asyncWrapper = require("../models/asyncWrapper");
const { Category, validateCreateCategory } = require("../models/category");
const { cloudinaryUploadImage } = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");

/**-----------------------------------------------
 * @desc    Create New Category
 * @route   /api/categories
 * @method  POST
 * @access  private (only admin)
 ------------------------------------------------*/
const createCategoryCtrl = asyncWrapper(async (req, res) => {
  // 1. Validation for image
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }
  // 2. Validation for data
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 3. Upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 4. Create new category
  const category = await Category.create({
    title: req.body.title,
    user: req.user.id,
    categoryImage: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // 5. Send response to client
  res.status(201).json(category);

  // 5. Remvoe image from the server
  fs.unlinkSync(imagePath);
});

/**-----------------------------------------------
 * @desc    Get All Categories
 * @route   /api/categories
 * @method  GET
 * @access  public
 ------------------------------------------------*/
const getAllCategoriesCtrl = asyncWrapper(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

/**-----------------------------------------------
 * @desc    Delete Category
 * @route   /api/categories/:id
 * @method  DELETE
 * @access  private (only admin)
 ------------------------------------------------*/
const deleteCategoryCtrl = asyncWrapper(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "category has been deleted successfully",
    categoryId: category._id,
  });
});

module.exports = {
  getAllCategoriesCtrl,
  createCategoryCtrl,
  deleteCategoryCtrl,
};
