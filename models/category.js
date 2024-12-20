const mongoose = require("mongoose");
const Joi = require("joi");

// Category Schema
const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    categoryImage: {
        type: Object,
      default: {
        url: "",
        publicId: null,
      },
    }
}, {
    timestamps: true,
});

// Category Model
const Category = mongoose.model("Category", CategorySchema);

// Validate Create Category
function validateCreateCategory(obj) {
    const schema = Joi.object({
        title: Joi.string().trim().required().label("Title"),
    });
    return schema.validate(obj);
}


module.exports = {
    Category,
    validateCreateCategory
}