const express = require("express");
const usersRouter = require("./routes/users.route");
const routerProduct = require("./routes/product.route");
const routerAuth = require("./routes/auth.route");
const routeCategories = require("./routes/categoriseRoute")
const routeCart = require("./routes/cart.router")
const cors = require("cors");

require("dotenv").config();
const mongoose = require("mongoose");
const httpStatusText = require("./utils/httpStatusText");
// const error = require('./utils/appError')

const url = process.env.MONGO_URL;
const path = require("path");

mongoose.connect(url).then(() => console.log("connected to database"));

const app = express();

app.use(cors({
  origin: "https://royal-tex.surge.sh/" 
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

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

app.listen(process.env.PORT || 4000, () => {
  console.log("server is running on port 4000");
});
