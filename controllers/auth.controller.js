const passport = require("passport");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// user model
const User = require("../models/user");
const {
  send_account_verification_email,
  send_forgot_password_email,
} = require("./email.controller");

// register handle
exports.register = async (req, res) => {
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
  await User.findOne({ email: email }).then(async (user) => {
    // user already exists
    if (user) {
      errors.push({ msg: "This email already registered" });
      return res.render("register", {
        errors,
        ...req.body,
      });
    }

    const token = jwt.sign({ name, email, password }, process.env.JWT_KEY, {
      expiresIn: "30m",
    });

    // send the verification email
    send_account_verification_email(req, res, token, email);
  });
};

// activate account handle
exports.activate = (req, res) => {
  const { token } = req.params;

  if (!token) {
    req.flash("error_msg", "Account activation error! Please try again later");
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
        req.flash("error_msg", "This email already registered! Please log in");
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
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  let errors = [];

  // Checking input values
  if (!email) {
    errors.push({ msg: "Please enter an email address" });
  }

  if (errors.length > 0) {
    return res.render("forgot", {
      errors,
      email,
    });
  }

  User.findOne({ email: email }).then((user) => {
    // User already exists
    if (!user) {
      errors.push({
        msg: "A user with this mail is not registered in our system",
      });
      return res.render("forgot", {
        errors,
        email,
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_KEY, {
      expiresIn: "30m",
    });
    User.updateOne({ resetLink: token }, (err, success) => {
      if (err) {
        errors.push({ msg: "Error reseting password" });
        return res.render("forgot", {
          errors,
          email,
        });
      }
      send_forgot_password_email(req, res, token, email);
    });
  });
};

// redirect to reset handle
exports.gotoReset = (req, res) => {
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

exports.resetPassword = (req, res) => {
  var { password, password2 } = req.body;
  const id = req.params.id;

  // Checking input values
  if (!password || !password2) {
    req.flash("error_msg", "Please enter all inputs");
    res.redirect(`/auth/reset/${id}`);
  }

  //   Checking password match
  else if (password != password2) {
    req.flash("error_msg", "Passwords do not match");
    res.redirect(`/auth/reset/${id}`);
  }

  // Checking password length
  else if (password.length < 8) {
    req.flash("error_msg", "Password must be at least 8 characters");
    res.redirect(`/auth/reset/${id}`);
  }

  // Update User
  else {
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(password, salt, (err, hash) => {
        if (err) throw err;
        User.findByIdAndUpdate(
          { _id: id },
          { password: hash },
          (err, result) => {
            if (err) {
              req.flash(
                "error_msg",
                "Error resetting password! Please try again later"
              );
              res.redirect(`/auth/reset/${id}`);
            } else {
              req.flash("success_msg", "Password reset successfully!");
              res.redirect("/auth/login");
            }
          }
        );
      });
    });
  }
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
