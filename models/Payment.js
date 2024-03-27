const User = require("./User");
const Sequelize = require("sequelize");
const db = require("../config/db");

const Payment = db.define("Payment", {
  _id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  paymentId: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
    defaultValue: "pending",
  },
});

module.exports = Payment;
