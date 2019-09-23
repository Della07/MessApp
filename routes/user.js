var crypto = require("crypto");
var User = require("../models/user");
var secret = require("../secret/secret");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");

module.exports = (app, passport) => {
  app.post("/upload", (req, res) => {
    var form = new formidable.IncomingForm();

    form.uploadDir = path.join(__dirname, "../public/uploads");

    form.on("file", (field, file) => {
      fs.rename(file.path, path.join(form.uploadDir, file.name), err => {
        if (err) {
          throw err;
        }

        console.log("File has been renamed");
      });
    });

    form.on("error", err => {
      console.log("An error occured", err);
    });

    form.on("end", () => {
      console.log("File upload was successful");
    });

    form.parse(req);
  });

  app.get("/", (req, res, next) => {
    var errors = req.flash("error");
    res.render("login", {
      title: "Login || Messaging App",
      messages: errors,
      hasErrors: errors.length > 0
    });
  });

  app.get("/signup", (req, res) => {
    var errors = req.flash("error");
    res.render("signup", {
      title: "Sign Up || Messaging App",
      messages: errors,
      hasErrors: errors.length > 0
    });
  });

  app.post(
    "/signup",
    validate,
    passport.authenticate("local.signup", {
      successRedirect: "/home",
      failureRedirect: "/signup",
      failureFlash: true
    })
  );

  app.get("/login", (req, res) => {
    var errors = req.flash("error");
    res.render("login", {
      title: "Login || Messaging App",
      messages: errors,
      hasErrors: errors.length > 0
    });
  });

  app.post(
    "/login",
    loginValidation,
    passport.authenticate("local.login", {
      //        successRedirect: '/home',
      failureRedirect: "/login",
      failureFlash: true
    }),
    (req, res) => {
      res.redirect("/home");
      //   console.log(req);
    }
  );

  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/home",
      failureRedirect: "/login",
      failureFlash: true
    })
  );

  app.get("/home", (req, res) => {
    User.find({}, (err, data) => {
      console.log(data);
      res.render("home", {
        title: "Message",
        user: req.user,
        data: data
      });
    });
  });

  app.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy(err => {
      res.redirect("/login");
    });
  });
};

function validate(req, res, next) {
  req.checkBody("fullname", "Fullname is Required").notEmpty();
  req
    .checkBody("fullname", "Fullname Must Not Be Less Than 5")
    .isLength({ min: 5 });
  req.checkBody("email", "Email is Required").notEmpty();
  req.checkBody("email", "Email is Invalid").isEmail();
  req.checkBody("password", "Password is Required").notEmpty();
  req
    .checkBody("password", "Password Must Not Be Less Than 5")
    .isLength({ min: 5 });
  req
    .check("password", "Password Must Contain at least 1 Number.")
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

  var errors = req.validationErrors();

  if (errors) {
    var messages = [];
    errors.forEach(error => {
      messages.push(error.msg);
    });

    req.flash("error", messages);
    res.redirect("/signup");
  } else {
    return next();
  }
}

function loginValidation(req, res, next) {
  req.checkBody("email", "Email is Required").notEmpty();
  req.checkBody("email", "Email is Invalid").isEmail();
  req.checkBody("password", "Password is Required").notEmpty();
  req
    .checkBody("password", "Password Must Not Be Less Than 5 Characters")
    .isLength({ min: 5 });
  req
    .check("password", "Password Must Contain at least 1 Number.")
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

  var loginErrors = req.validationErrors();

  if (loginErrors) {
    var messages = [];
    loginErrors.forEach(error => {
      messages.push(error.msg);
    });

    req.flash("error", messages);
    res.redirect("/login");
  } else {
    return next();
  }
}
