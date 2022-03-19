const express = require("express");
const router = express.Router();

// welcome router
router.get("/", (req, res) => {
  res.render("welcome");
});

// dashboard router
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard', {
    name: req.user.name
}));

module.exports = router;
