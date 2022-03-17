const express = require("express");
const router = express.Router();

// welcome route
router.get("/", (req, res) => {
  res.render("welcome");
});

// dashboard route
router.get("/dashboard", (req, res) =>
  res.render("dashboard", {
    name: "Furkan Gulsen",
  })
);

module.exports = router;
