const { Router } = require("express");
const {
  register,
  login,
  forgotPassword,
  setNewPassword,
  resetPassword,
} = require("../controllers/auth");
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.get("/resetPassword/:resetToken", setNewPassword);
router.put("/resetPassword", resetPassword);

module.exports = router;
