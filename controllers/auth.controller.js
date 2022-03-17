const passport = require("passport");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require("jsonwebtoken");

// user model
const User = require("../models/user");

// register handle
exports.register = (req, res) => {
  console.log("register is working");
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Checking input values
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all input" });
  }

  //   Checking password match
  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Checking password length
  if (password.length < 8) {
    errors.push({ msg: "Password must be at least 8 characters" });
  }

  if (errors.length > 0) {
    return res.render("register", {
      errors,
      ...req.body,
    });
  }

  // validation passed
  User.findOne({ email: email }).then((user) => {
    // user already exists
    if (user) {
      errors.push({ msg: "This email already registered" });
      return res.render("register", {
        errors,
        ...req.body,
      });
    }

    // if the user is not registered in the system
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
    const accessToken = oauth2Client.getAccessToken();

    const token = jwt.sign({ name, email, password }, JWT_KEY, {
      expiresIn: "2h",
    });

    const output = `
    <h2>Click on the link below to activate your account</h2>
    <p style="font-weight:bold">http://${req.headers.host}/auth/activate/${token}</p>
    <p style="opacity:.75">The link above will expire in 2 hours.</p>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `"Auth Admin" <${process.env.EMAIL}>`,
      to: email,
      subject: "Account Verification: NodeJS Auth System",
      generateTextFromHTML: true,
      html: output,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        req.flash(
          "error_msg",
          "Something went wrong on our end. Please register again."
        );
        res.redirect("/auth/login");
      } else {
        console.log("Mail sent : %s", info.response);
        req.flash(
          "success_msg",
          "Activation link sent to email ID. Please activate to log in."
        );
        res.redirect("/auth/login");
      }
    });
  });
};

// activate account handle
exports.activate = (req, res) => {
  const { token } = req.params;

  if (!token) {
    req.flash("error_msg", "Account activation error! Please try again later.");
    return res.redirect("/auth/login");
  }

  jwt.verify(token, process.env.JWT_KEY, (err, decodedToken) => {
    if (err) {
      req.flash(
        "error_msg",
        "Incorrect or expired link! Please register again."
      );
      return res.redirect("/auth/register");
    }

    const { name, email, password } = decodedToken;
    User.findOne({ email }).then((user) => {
      if (user) {
        // user already exists
        req.flash("error_msg", "This email already registered! Please log in.");
        return res.redirect("/auth/login");
      }

      // create new user
      const newUser = new User({
        name,
        email,
        password,
      });
      bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              req.flash(
                "success_msg",
                "Account activated. Now, you can log in."
              );
              res.redirect("/auth/login");
            })
            .catch((err) => {
              console.error(err);
            });
        });
      });
    });
  });
};

// forgot password handle
exports.forgotPassword = (req, res) => {};

// redirect to reset handle
exports.passwordReset = (req, res) => {
  const { token } = req.params;

  if (!token) {
    req.flash("error_msg", "Password reset error! Please try again later.");
    return res.redirect("/auth/login");
  }

  jwt.verify(token, process.env.JWT_RESET_KEY, (err, decodedToken) => {
    if (err) {
      req.flash("error_msg", "Incorrect or expired link! Please try again.");
      res.redirect("/auth/login");
    } else {
      const { _id } = decodedToken;
      User.findById(_id, (err, user) => {
        if (err) {
          req.flash(
            "error_msg",
            "User with email doesn't exist! Please try again."
          );
          res.redirect("/auth/login");
        } else {
          res.redirect(`/auth/reset/${_id}`);
        }
      });
    }
  });
};

// login handle
exports.login = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
};

// logout handle
exports.logout = (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/auth/login");
};
