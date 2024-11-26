const jwt = require("jsonwebtoken");
const httpStatusText = require("../utils/httpStatusText");
const appError = require("../utils/appError");

const verifyToken = (req, res, next) => {
  
  const authHeader =
    req.query["Authorization"] || req.query["authorization"];
  if (!authHeader) {
    const error = appError.create(
      "token is required",
      401,
      httpStatusText.FAIL
    );

    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.currentUser =  currentUser;

    console.log("🚀 ~ verifyToken ~ currentUser:", currentUser)
    next();
  } catch (err) {
    const error = appError.create("invalid token", 401, httpStatusText.FAIL);

    return next(error);
  }
};
module.exports = verifyToken;
