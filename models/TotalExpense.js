const Sequelize = require("sequelize");
const db = require("../config/db");

const TotalExpense = db.define("TotalExpense", {
  _id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  totalExpense: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = TotalExpense;
