const { Router } = require("express");
const { getUser } = require("../controllers/user");
const { protect } = require("../middleware/protect");
const router = Router();

router.get("/getMe", protect, getUser);

module.exports = router;
