const express = require("express");
const router = express.Router();

// importing controllers
const authController = require("../controllers/auth.controller");

// login route
router.get("/login", (req, res) => {});

// forgot password route
router.get("/forgot", (req, res) => {});

// reset password route
router.get("/reset/:id", (req, res) => {});

// register route
router.get("/register", (req, res) => {
  res.render("register");
});

// register post handle
router.post("/register", (req, res) => {});

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
