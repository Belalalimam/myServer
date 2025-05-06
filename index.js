const express = require("express");

const usersRouter = require("./routes/users.route");
const routerProduct = require("./routes/product.route");
const routerAuth = require("./routes/auth.route");
const routeCategories = require("./routes/categoriseRoute")
const routeCart = require("./routes/cart.router")

const httpStatusText = require("./utils/httpStatusText");
const passportConfig = require("./config/passport");

const mongoose = require("mongoose");

const cors = require("cors");
const xss = require("xss-clean")
const hpp = require("hpp")
const helmet = require("helmet")
const passport = require('passport');
const session = require('express-session');
const logger = require("morgan");
const rateLimit = require("express-rate-limit")
require("dotenv").config();


const url = process.env.MONGO_URL;
const path = require("path");
 
mongoose.connect(url).then(() => console.log("connected to database"));
 
const app = express();

app.use(cors({
  // origin: "http://localhost:5173",
  origin: "https://royal-tex.shutterfly-alu.com",
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(xss())
app.use(hpp())
app.use(helmet())
// app.use(logger("dev"));  
app.use(express.json());
passportConfig(passport);
// Passport middleware
app.use(passport.session());
app.use(passport.initialize());

require("./config/passport")(passport);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routs
app.use("/api/auth", routerAuth);
app.use("/api/users", usersRouter);
app.use("/products", routerProduct);
app.use("/api/categories", routeCategories);
app.use('/api/cart', routeCart);

app.all("*", (req, res) => {
  return res
    .status(404)
    .json({ status: httpStatusText.ERROR, message: "Route not found" });
});

app.use((error, req, res, next) => {
  res.status(error.httpStatusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.httpStatusCode || 500,
    data: null,
  });
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://royal-tex.shutterfly-alu.com');
  // res.header('Access-Control-Allow-Origin', 'https://royal-tex.surge.sh');
  // res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server is running on port 4000");
});
 