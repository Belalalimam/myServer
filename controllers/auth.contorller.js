const asyncWrapper = require("../models/asyncWrapper");
const bcrypt = require("bcryptjs");
const {
  Users,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/users.moduls");
const VerificationToken = require("../models/VerificationToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { verifyGoogleToken } = require("../middlewares/verifyGoogleToken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

/**-----------------------------------------------
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 ------------------------------------------------*/
const registerUserCtrl = asyncWrapper(async (req, res) => {
console.log("🚀 ~ registerUserCtrl ~ req:", req.user)

  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "user already exist" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user = new Users({
    fullname: req.body.fullname,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();

  // Creating new VerificationToken & save it toDB
  const verificationToken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await verificationToken.save();

  // Making the link
  const link = `https://royal-tex.shutterfly-alu.com/users/${user._id}/verify/${verificationToken.token}`;

  // Putting the link into an html template
  const htmlTemplate = `
    <div>
      <p>Click on the link below to verify your email</p>
      <a href="${link}">Verify</a>
    </div>`;

  // Sending email to the user
  await sendEmail(user.email, "Verify Your Email", htmlTemplate);

  // Response to the client
  res.status(201).json({
    message: "We sent to you an email, please verify your email address",
  });
});

/**-----------------------------------------------
 * @desc    Login User
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 ------------------------------------------------*/
const loginUserCtrl = asyncWrapper(async (req, res) => {
  const { error } = validateLoginUser(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await Users.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  if (!user.isAccountVerified) {
    let verificationToken = await VerificationToken.findOne({
      userId: user._id,
    });

    if (!verificationToken) {
      verificationToken = new VerificationToken({
        userId: user._id,

        token: crypto.randomBytes(32).toString("hex"),
      });
      await verificationToken.save();
    }

    const link = `https://royal-tex.shutterfly-alu.com/users/${user._id}/verify/${verificationToken.token}`;

    const htmlTemplate = `
    <div>
      <p>Click on the link below to verify your email</p>
      <a href="${link}">Verify</a>
    </div>`;

    await sendEmail(user.email, "Verify Your Email", htmlTemplate);

    return res.status(400).json({
      message: "We sent to you an email, please verify your email address",
    });
  }

  const token = user.generateAuthToken();
  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    token,
    fullname: user.fullname,
  });
});

/**-----------------------------------------------
 * @desc    Google Login User
 * @route   /api/auth/googlelogin
 * @method  POST
 * @access  public
 ------------------------------------------------*/
const googleLoginUserCtrl = (passport) => {
   passport.serializeUser(function (user, done) {
     done(null, user.id);
   });
   passport.deserializeUser(function (id, done) {
     Users.findById(id, function (err, user) {
       done(err, user);
     });
   });
   passport.use(
     new GoogleStrategy(
       {
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: "http://localhost:4000/api/auth/google/callback",
       },
       function (accessToken, refreshToken, profile, cb) {
         console.log(profile);
         Users.findOne({ googleId: profile.id }, async function (err, user) {
           if (user) {
             const updatedUser = {
               fullname: profile.displayName,
               email: profile.emails[0].value,
               pic: profile.photos[0].value,
               secret: accessToken,
             };
             await Users.findOneAndUpdate(
               { _id: user.id },
               { $set: updatedUser },
               { new: true }
             ).then((result) => {
               return cb(err, result);
             });
           } else {
             const newUser = new Users({
               googleId: profile.id,
               fullname: profile.displayName,
               email: profile.emails[0].value,
               pic: profile.photos[0].value,
               secret: accessToken,
             });
             newUser.save().then((result) => {
               return cb(err, result);
             });
           }
         });
       }
     )
   );
 };

/**-----------------------------------------------
 * @desc    Verify User Account
 * @route   /api/auth/:userId/verify/:token
 * @method  GET
 * @access  public
 ------------------------------------------------*/
const verifyUserAccountCtrl = asyncWrapper(async (req, res) => {
  const user = await Users.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }

  user.isAccountVerified = true;
  await user.save();

  await VerificationToken.deleteOne({ _id: verificationToken._id });

  res.status(200).json({ message: "Your account verified" });
});
/**-----------------------------------------------
 * @desc    Google Callback
 * @route   /api/auth/google/callback
 ------------------------------------------------*/
 const googleCallbackCtrl = asyncWrapper(async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("No user object found");
    }
    
    const user = req.user;
    // The token is already generated in passport.js and attached to the user object
    const token = user.token;
    
    // Use environment variables for base URLs
    const clientBaseUrl = process.env.CLIENT_BASE_URL || "https://royal-tex.shutterfly-alu.com";
    
    // Redirect with user information and token
    const redirectUrl = `${clientBaseUrl}/login?` + 
      `email=${encodeURIComponent(user.email)}` +
      `&fullname=${encodeURIComponent(user.fullname)}` +
      `&token=${encodeURIComponent(token)}` +
      `&_id=${encodeURIComponent(user._id)}` +
      `&pic=${encodeURIComponent(user.pic || '')}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error:", error);
    const clientBaseUrl = process.env.CLIENT_BASE_URL || "https://royal-tex.shutterfly-alu.com";
    res.redirect(`${clientBaseUrl}/login?error=${encodeURIComponent(error.message || 'auth_failed')}`);
  }
});




module.exports = {
  registerUserCtrl,
  loginUserCtrl,
  googleLoginUserCtrl,
  verifyUserAccountCtrl,
  googleCallbackCtrl
};
