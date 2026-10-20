const express = require("express");
const router = express.Router();
const authController = require("../controllers/loginController");
const {
  authenticateToken,
  authenticateTrocaDeSenha,
} = require("../middleware/middleware");
const {
  validateLogin,
  validateChangePassword,
} = require("../middleware/validation");

router.post("/login", validateLogin, authController.login);
router.get("/session", authenticateToken, authController.session);
router.post(
  "/change-password",
  authenticateTrocaDeSenha,
  validateChangePassword,
  authController.changePassword,
);

module.exports = router;
