const Sequelize = require("sequelize");

const db = new Sequelize("expense-tracker", "root", "pritam123", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = db;
