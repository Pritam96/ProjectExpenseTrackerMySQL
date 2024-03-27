const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");

exports.addCategory = async (req, res, next) => {
  try {
    const { categoryName, description } = req.body;
    let data = { categoryName, description };
    if (!req.user.isAdmin) {
      return next(new ErrorResponse("Not authorize to do this action", 401));
    }
    const category = await Category.create(data);
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      success: true,
      data: {
        count: categories.length,
        categories: categories,
      },
    });
  } catch (error) {
    next(error);
  }
};
