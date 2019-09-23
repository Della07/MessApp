var express = require("express");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var engine = require("ejs-mate");
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");
var moment = require("moment");
var session = require("express-session");
var validator = require("express-validator");

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/message", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

require("./config/passport");
require("./secret/secret");

app.use(express.static("public"));
app.engine("ejs", engine);
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(validator());

app.use(
  session({
    secret: "Thisismytestkey",
    resave: false,
    saveUninitialized: false
    // store: new MongoStore({mongooseConnection: mongoose.connection})
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// app.locals._ = _;
app.locals.moment = moment;

require("./routes/user")(app, passport);
require("./routes/message")(app);

app.listen(3000, function() {
  console.log("Listening on port 3000");
});
