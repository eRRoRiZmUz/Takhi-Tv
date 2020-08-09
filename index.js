const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("errorhandler");
passport = require("passport");
require("dotenv");
require("./passport");
//routes
const user = require("./routes/user");
const admin = require("./routes/admin");
const isProduction = process.env.NODE_ENV === "production";
//Initiate our app
const app = express();
app.use(passport.initialize());
//Configure our app
app.use(cors());
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
//app.use(session({ secret: 'mTripToshiDesu', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
if (!isProduction) {
  app.use(errorHandler());
}
//routes
app.use(user);
app.use(admin);
//Error handlers & middlewares
if (!isProduction) {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});
app.listen(2000, () => console.log("Server running on http://localhost:2000/"));
