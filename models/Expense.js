const Sequelize = require("sequelize");
const db = require("../config/db");

const Expense = db.define("Expense", {
  _id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  statement: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  subExpense: {
    type: Sequelize.STRING,
  },
});

module.exports = Expense;
