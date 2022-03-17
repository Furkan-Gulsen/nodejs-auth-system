const express = require("express");
const router = express.Router();

// importing controllers
const authController = require("../controllers/auth.controller");

// login route
router.get("/login", (req, res) => {
  console.log("register is working: ", process.env.CLIENT_ID);
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
router.post("/register", (req, res) => {
  authController.register(req, res);
});

// email activate handle
router.get("/activate/:token", (req, res) => {});

// forgot password handle
router.post("/forgot", (req, res) => {});

// reset password handle
router.post("/reset/:id", (req, res) => {});

// reset token handle
router.get("/forgot/:token", (req, res) => {});

// login post handle
router.post("/login", (req, res) => {});

// logout get handle
router.get("/logout", (req, res) => {});

module.exports = router;
