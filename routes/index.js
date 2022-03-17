const express = require("express");
const router = express.Router();

// welcome route
router.get("/", (req, res) => {
  res.render("welcome");
});

module.exports = router;
