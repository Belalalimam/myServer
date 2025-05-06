const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Users } = require("../models/users.moduls");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

module.exports = (passport) => {
  passport.serializeUser(function (user, done) {
    // Store the token in the session
    done(null, { id: user.id, token: user.token });
  });

  passport.deserializeUser(async function (obj, done) {
    try {
      const user = await Users.findById(obj.id);
      if (user) {
        // Add the token to the user object
        user.token = obj.token;
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://myserver-app.up.railway.app/api/auth/google/callback",
      },
      async function (accessToken, refreshToken, profile, cb) {
        try {
          console.log(`Google auth attempt for user: ${profile.displayName}, ID: ${profile.id}`);
          
          // Check for required profile data
          if (!profile.emails || profile.emails.length === 0) {
            return cb(new Error("No email found in Google profile"), null);
          }
          
          const profileEmail = profile.emails[0].value;
          const profilePic = profile.photos && profile.photos.length > 0 
            ? profile.photos[0].value 
            : null;

          // Find user using async/await
          let user = await Users.findOne({ googleId: profile.id });

          if (user) {
            const updatedUser = {
              fullname: profile.displayName,
              email: profileEmail,
              pic: profilePic,
              secret: accessToken,
            };

            // Update user using async/await
            user = await Users.findOneAndUpdate(
              { _id: user.id },
              { $set: updatedUser },
              { new: true }
            );
            
            // Generate auth token
            const token = user.generateAuthToken();
            user.token = token; // Add token to user object
            
            return cb(null, user);
          } else {
            // Generate a random password for Google users
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);
            
            const newUser = new Users({
              googleId: profile.id,
              fullname: profile.displayName,
              email: profileEmail,
              password: hashedPassword,
              pic: profilePic,
              secret: accessToken,
              isAccountVerified: true,
              authMethod: 'google'
            });

            // Save user using async/await
            const savedUser = await newUser.save();
            
            // Generate auth token
            const token = savedUser.generateAuthToken();
            savedUser.token = token; // Add token to user object
            
            return cb(null, savedUser);
          }
        } catch (err) {
          console.error("Google auth error:", err);
          return cb(err, null);
        }
      }
    )
  );
};
