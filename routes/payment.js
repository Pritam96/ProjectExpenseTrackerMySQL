const { Router } = require("express");
const { createOrder, capturePayment } = require("../controllers/payment");
const { protect } = require("../middleware/protect");
const router = Router();

router.post("/createOrder", protect, createOrder);
router.post("/capturePayment", protect, capturePayment);

module.exports = router;
