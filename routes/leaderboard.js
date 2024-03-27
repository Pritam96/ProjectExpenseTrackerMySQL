const { Router } = require("express");
const { getUsersWithTopExpenses } = require("../controllers/leaderboard");
const { protect } = require("../middleware/protect");
const router = Router();

router.get("/", protect, getUsersWithTopExpenses);

module.exports = router;
