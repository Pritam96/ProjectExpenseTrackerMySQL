const { Router } = require("express");
const { getExpensesByRange, downloadCsv } = require("../controllers/report");
const { protect } = require("../middleware/protect");
const router = Router();

router.get("/", protect, getExpensesByRange);
router.get("/download", protect, downloadCsv);

module.exports = router;
