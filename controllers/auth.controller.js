const passport = require("passport");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require("jsonwebtoken");

// GLOBAL (CONST) Variables
const JWT_KEY = "furkangulsen_jwt_token";
const JWT_RESET_KEY = "furkangulsen_jwt_reset_key";

// user model
const user = require("../models/user");

// register handle
// exports.register_handle = (req, res) => {
//   const { name, email, password, password2 } = req.body;
// };

// activate account handle

// forgot password handle

// redirect to reset handle

// signin handle

// signout handle
