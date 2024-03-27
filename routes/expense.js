const { Router } = require("express");
const {
  postExpense,
  getExpenses,
  getExpense,
  postEditExpense,
  deleteExpense,
} = require("../controllers/expense");
const { protect } = require("../middleware/protect");
const router = Router();

router.post("/", protect, postExpense);
router.get("/", protect, getExpenses);
router.get("/:expenseId", protect, getExpense);
router.post("/:expenseId", protect, postEditExpense);
router.delete("/:expenseId", protect, deleteExpense);

module.exports = router;
