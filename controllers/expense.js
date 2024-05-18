const Expense = require("../models/Expense");
const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");
const db = require("../config/db");

exports.postExpense = async (req, res, next) => {
  let transaction;

  try {
    const { statement, category, amount, subExpense } = req.body;

    transaction = await db.transaction();

    // Required Fields
    const enteredData = {
      statement,
      amount,
      categoryId: category,
    };

    // Optional Field
    if (subExpense) enteredData.subExpense = subExpense;
    const expense = await req.user.createExpense(enteredData, { transaction });

    // Update TotalExpense of that user
    const prevTotalExpense = await req.user.getTotalExpense({ transaction });
    prevTotalExpense.totalExpense = +amount + prevTotalExpense.totalExpense;
    await prevTotalExpense.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 3;
    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId: req.user._id },
      include: [
        {
          model: Category,
          attributes: ["categoryName", "description"],
          as: "category",
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Pagination result
    const pagination = {
      total: Math.ceil(count / limit),
      current: page,
    };

    if (offset + limit < count) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (offset > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count,
      pagination,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findByPk(expenseId);
    if (!expense) {
      return next(new ErrorResponse("Resource not found", 404));
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

exports.postEditExpense = async (req, res, next) => {
  const { expenseId } = req.params;

  let transaction;

  try {
    const { statement, category, amount, subExpense } = req.body;

    transaction = await db.transaction();

    // Required Fields
    const enteredData = {
      statement,
      amount,
      categoryId: category,
    };

    // Optional Field
    if (subExpense) enteredData.subExpense = subExpense;

    const expense = await Expense.findByPk(expenseId);
    const prevAmount = expense.amount;
    await expense.update(enteredData, { transaction });

    // Update TotalExpense of that user
    const prevTotalExpense = await req.user.getTotalExpense({ transaction });
    prevTotalExpense.totalExpense =
      +amount + prevTotalExpense.totalExpense - +prevAmount;

    await prevTotalExpense.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  let transaction;

  try {
    const { expenseId } = req.params;

    transaction = await db.transaction();

    const expense = await Expense.findByPk(expenseId);
    if (!expense) {
      return next(new ErrorResponse("Resource not found", 404));
    }
    await expense.destroy({ transaction });

    // Update TotalExpense of that user
    const prevTotalExpense = await req.user.getTotalExpense({ transaction });
    prevTotalExpense.totalExpense =
      prevTotalExpense.totalExpense - +expense.amount;

    if (prevTotalExpense.totalExpense < 0) prevTotalExpense.totalExpense = 0;
    await prevTotalExpense.save({ transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};
