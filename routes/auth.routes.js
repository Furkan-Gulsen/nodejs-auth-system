const express = require("express");
const router = express.Router();

// importing controllers
const authController = require("../controllers/auth.controller");

// login route
router.get("/login", (req, res) => {
  res.render("login");
});

// forgot password route
router.get("/forgot", (req, res) => {
  res.render("forgot");
});

// reset password route
router.get("/reset/:id", (req, res) => {
  res.render("reset", { id: req.params.id });
});

// register route
router.get("/register", (req, res) => {
  res.render("register");
});

// register post handle
router.post("/register", authController.register);

// email activate handle
router.get("/activate/:token", authController.activate);

// forgot password handle
router.post("/forgot", authController.forgotPassword);

// reset password handle
router.post("/reset/:id", authController.resetPassword);

// reset token handle
router.get("/forgot/:token", authController.gotoReset);

// login post handle
router.post("/login", authController.login);

// logout get handle
router.get("/logout", authController.logout);

module.exports = router;
