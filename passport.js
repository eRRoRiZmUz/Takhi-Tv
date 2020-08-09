const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
// passport setting
passport.serializeUser(function (user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  console.log(obj);
  done(null, obj);
});
passport.use(
  new FacebookStrategy(
    {
      clientID: "337927740553265",
      clientSecret: "eb3f904cc00cc12ec3d18fc3c9ccbc67",
      callbackURL: `http://localhost:${
        process.env.PORT || 2000
      }/api/user/facebook/callback`,
      profileFields: ["id", "emails", "name"],
    },
    function (accessToken, refreshToken, profile, callback) {
      console.log(profile);
      return callback(null, profile);
    }
  )
);
