const asyncWrapper = require("../models/asyncWrapper");
const { Users, validateUpdateUser } = require("../models/users.moduls");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage
} = require("../utils/cloudinary");


 
/**-----------------------------------------------
 * @desc    Get All Users Profile
 * @route   /api/users/
 * @method  GET
 * @access  private (only admin) 
 ------------------------------------------------*/
 const getUsers = asyncWrapper(async (req, res) => {
  const users = await Users.find().select("-password")
  res.status(200).json(users);
});

/**-----------------------------------------------
 * @desc    Get User Profile  
 * @route   /api/users/Profile/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 const Profile = asyncWrapper(async (req, res) => {
  const user = await Users.findById(req.params.id)
   .select("-password").populate("likes").populate("fullname");

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  res.status(200).json(user);
});

/**-----------------------------------------------
 * @desc    Update User Profile
 * @route   /api/users/editUser/:id
 * @method  PUT
 * @access  private (only user himself)
 ------------------------------------------------*/
const editUser = asyncWrapper(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await Users.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        password: req.body.password,
      },
    },
    { new: true }
  )//.select("-password")

  res.status(200).json(updatedUser);
});

/**-----------------------------------------------
 * @desc    Get Users Count
 * @route   /api/users/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
 const getUsersCount = asyncWrapper(async (req, res) => {
  const count = await Users.countDocuments();
  res.status(200).json(count);
});

/**-----------------------------------------------
 * @desc    Profile Photo Upload
 * @route   /api/users/profile/profile-photo-upload
 * @method  POST
 * @access  private (only logged in user)
 ------------------------------------------------*/
 const profilePhotoUploadCtrl = asyncWrapper(async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }

  // 2. Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  // 3. Upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);

  // 4. Get the user from DB
  const user = await User.findById(req.user.id);

  // 5. Delete the old profile photo if exist
  if (user.profilePhoto?.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  // 6. Change the profilePhoto field in the DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  // 7. Send response to client
  res.status(200).json({
    message: "your profile photo uploaded successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  // 8. Remvoe image from the server
  fs.unlinkSync(imagePath);
});

/**-----------------------------------------------
 * @desc    Delete User Profile (Account)
 * @route   /api/users/deleteUser/:id
 * @method  DELETE
 * @access  private (only admin or user himself)
 ------------------------------------------------*/
 const deleteUser = asyncWrapper(async (req, res) => {
  // 1. Get the user from DB
  const user = await Users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  // // 2. Get all posts from DB
  // const posts = await Post.find({ user: user._id });

  // // 3. Get the public ids from the posts
  // const publicIds = posts?.map((post) => post.image.publicId);

  // // 4. Delete all posts image from cloudinary that belong to this user
  // if(publicIds?.length > 0) {
  //   await cloudinaryRemoveMultipleImage(publicIds);
  // }

  // // 5. Delete the profile picture from cloudinary
  // if(user.profilePhoto.publicId !== null) {
  //   await cloudinaryRemoveImage(user.profilePhoto.publicId);
  // }
  
  // // 6. Delete user posts & comments
  // await Post.deleteMany({ user: user._id });
  // await Comment.deleteMany({ user: user._id });

  // 7. Delete the user himself
  await Users.findByIdAndDelete(req.params.id);

  // 8. Send a response to the client
  res.status(200).json({ message: "your profile has been deleted" });
});

module.exports = {
  getUsers,
  Profile,
  editUser,
  getUsersCount,
  deleteUser,
}
