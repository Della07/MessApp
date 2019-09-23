var passport = require("passport");
var User = require("../models/user");
var LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
var secret = require("../secret/secret");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (user) {
          return done(
            null,
            false,
            req.flash("error", "User With Email Already Exist.")
          );
        }

        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.gender = req.body.gender;
        newUser.password = newUser.encryptPassword(req.body.password);
        newUser.image = req.body.upload;

        newUser.save(err => {
          return done(null, newUser);
        });
      });
    }
  )
);

passport.use(
  "local.login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }

        var messages = [];

        if (!user || !user.validPassword(password)) {
          messages.push("Email Does Not Exist Or Password is Invalid");
          return done(null, false, req.flash("error", messages));
        }

        return done(null, user);
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    secret.google,
    (req, token, refreshToken, profile, done) => {
      User.findOne({ google: profile.id }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (user) {
          done(null, user);
        } else {
          var newUser = new User();
          newUser.google = profile.id;
          newUser.fullname = profile.displayName;
          newUser.email = profile._json.email;
          newUser.image = "http://placehold.it/100x100";

          newUser.save(function(err, data) {
            if (err) {
              console.log(err);
            }
            console.log(data);
            done(null, newUser);
          });
        }
      });
    }
  )
);
