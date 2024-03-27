const User = require("../models/User");
const Expense = require("../models/Expense");
const Category = require("../models/Category");
const TotalExpense = require("../models/TotalExpense");
const sequelize = require("sequelize");

// exports.getUsersWithTopExpenses = async (req, res, next) => {
//   try {
//     const users = await User.findAll({
//       attributes: [
//         "_id",
//         "username",
//         "email",
//         "phoneNumber",
//         [sequelize.fn("SUM", sequelize.col("Expenses.amount")), "totalExpense"],
//       ],
//       include: [
//         {
//           model: Expense,
//           attributes: [], // Ensure you select no fields from Expense to avoid unnecessary duplication
//         },
//       ],
//       group: ["User._id", "User.username", "User.email", "User.phoneNumber"],
//       order: [[sequelize.literal("totalExpense"), "DESC"]],
//       limit: 5,
//     });

//     res.status(200).json({ success: true, count: users.length, data: users });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getUsersWithTopExpenses = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: TotalExpense,
          attributes: ["totalExpense"],
        },
      ],
      order: [[TotalExpense, "totalExpense", "DESC"]],
      attributes: ["username", "email"],
    });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};
