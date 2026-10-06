const express = require("express");
const router = express.Router();
const authController = require("../controllers/loginController");
const authenticateToken = require("../middleware/middleware");
const {
  validateLogin,
  validateChangePassword,
} = require("../middleware/validation");

router.post("/login", validateLogin, authController.login);
router.get("/session", authenticateToken, authController.session);
router.post(
  "/change-password",
  authenticateToken,
  validateChangePassword,
  authController.changePassword,
);

module.exports = router;
