const { Parser } = require("json2csv");
const moment = require("moment");
const Expense = require("../models/Expense");
const Category = require("../models/Category");
const { Op } = require("sequelize");

exports.getExpensesByRange = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: {
        userId: req.user._id,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [
        {
          model: Category,
          attributes: ["categoryName", "description"],
          as: "category",
        },
      ],
      limit,
      offset,
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
      count: expenses.length,
      pagination,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadCsv = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  try {
    const expenses = await Expense.findAll({
      where: {
        userId: req.user._id,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [
        {
          model: Category,
          attributes: ["categoryName", "description"],
          as: "category",
        },
      ],
    });

    const expenseData = expenses.map((expense) => {
      const { _id, amount, statement, category, subExpense, createdAt } =
        expense;

      return {
        expenseId: _id.toString(),
        amount,
        title: statement,
        category: category ? category.categoryName : "",
        description: subExpense ? subExpense : "",
        date: moment(createdAt).format("MMMM Do YYYY, h:mm:ss a"),
      };
    });

    const csvFields = [
      "expenseId",
      "amount",
      "title",
      "category",
      "description",
      "date",
    ];

    console.log(expenseData);

    const csvParser = new Parser({ csvFields });
    const csvData = csvParser.parse(expenseData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment: filename=data${Date.now()}.csv`
    );

    res.status(200).end(csvData);
  } catch (error) {
    next(error);
  }
};
