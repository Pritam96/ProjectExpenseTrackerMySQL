const jwt = require("jsonwebtoken");
const User = require("../models/User");
// const ErrorResponse = require("../utils/errorResponse");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    // return next(new ErrorResponse("Not authorize to access this route", 401));
    return res
      .status(401)
      .json({ success: false, error: "Not authorize to access this route" });
  }

  try {
    // token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded._id);
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};
