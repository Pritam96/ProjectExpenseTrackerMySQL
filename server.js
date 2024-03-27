const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const errorHandler = require("./middleware/error");
const ErrorResponse = require("./utils/errorResponse");

const db = require("./config/db");

dotenv.config({ path: "./config/config.env" });

db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error:", err));

const auth = require("./routes/auth");
const user = require("./routes/user");
const category = require("./routes/category");
const expense = require("./routes/expense");
const payment = require("./routes/payment");
const leaderboard = require("./routes/leaderboard");
const report = require("./routes/report");

const app = express();

app.use(express.json());
app.use(cors());

const User = require("./models/User");
const Category = require("./models/Category");
const Payment = require("./models/Payment");
const Expense = require("./models/Expense");
const TotalExpense = require("./models/TotalExpense");

User.hasMany(Expense, { foreignKey: "userId" });
Expense.belongsTo(User, { foreignKey: "userId" });

User.hasOne(TotalExpense, { foreignKey: "userId" });
TotalExpense.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Expense, { foreignKey: "categoryId" });
Expense.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

User.hasMany(Payment, { foreignKey: "userId" });
Payment.belongsTo(User, { foreignKey: "userId" });

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/category", category);
app.use("/api/expense", expense);
app.use("/api/payment", payment);
app.use("/api/leaderboard", leaderboard);
app.use("/api/report", report);

app.use(errorHandler);

// Serve static files from the src directory
app.use(express.static("./src"));

// Catch-all route for handling wrong URLs
app.all("*", (req, res, next) => {
  return next(new ErrorResponse(`Invalid URL - ${req.originalUrl}`, 404));
});

// Serve index.html for the root URL
app.get("/", (req, res, next) => res.sendFile("index.html"));

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port: ${PORT}`);
// });

db
  // .sync({ force: true })
  // .sync({ alter: true })
  .sync()
  .then((result) => {
    app.listen(PORT, console.log(`Server is running on port: ${PORT}`));
  })
  .catch((err) => console.log(err));
