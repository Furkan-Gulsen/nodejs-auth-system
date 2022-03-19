const {
  activation_email,
  reset_link_email,
} = require("../config/email-templates");
const nodemailer = require("nodemailer");

exports.send_account_verification_email = (req, res, token, email) => {
  const activation_code = `http://${req.headers.host}/auth/activate/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // your email address
      pass: process.env.PASS, // your email password
    },
  });

  const mailOptions = {
    from: `"Auth Admin" <${process.env.EMAIL}>`,
    to: email,
    subject: "Account Verification: NodeJS Auth System",
    generateTextFromHTML: true,
    html: activation_email(activation_code),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      req.flash(
        "error_msg",
        "Something went wrong on our end. Please register again"
      );
      res.redirect("/auth/login");
    } else {
      console.log("Mail sent : %s", info.response);
      req.flash(
        "success_msg",
        "Activation link sent to email ID. Please activate to log in"
      );
      res.redirect("/auth/login");
    }
  });
};

exports.send_forgot_password_email = (req, res, token, email) => {
  const reset_link = `http://${req.headers.host}/auth/forgot/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // your email address
      pass: process.env.PASS, // your email password
    },
  });

  const mailOptions = {
    from: `"Auth Admin" <${process.env.EMAIL}>`,
    to: email,
    subject: "Account Password Reset: NodeJS Auth System",
    generateTextFromHTML: true,
    html: reset_link_email(reset_link),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      req.flash(
        "error_msg",
        "Something went wrong on our end. Please register again"
      );
      res.redirect("/auth/forgot");
    } else {
      console.log("Mail sent : %s", info.response);
      req.flash(
        "success_msg",
        "Password reset link sent to email ID. Please follow the instructions."
      );
      res.redirect("/auth/login");
    }
  });
};
