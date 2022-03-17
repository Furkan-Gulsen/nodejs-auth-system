const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const app = express();

// loads environment variables from .env file
require("dotenv").config();

// passport configuration
require("./config/passport")(passport);

// db configuration
const db = require("./config/key").MongoURI;

// Mongo connection
mongoose
  .connect(db)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.error(err));

// EJS Configuration
app.use(expressLayouts);
app.use("/assets", express.static("./assets"));
// set the view engine to ejs
app.set("view engine", "ejs");

// Bodyparser Configuration
app.use(express.urlencoded({ extended: false }));

// Express Session Configuration
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

// Connecting flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index.routes"));
app.use("/auth", require("./routes/auth.routes"));

const PORT = process.env.PORT | 3300;
app.listen(PORT, console.log(`Server running on PORT ${PORT}`));
