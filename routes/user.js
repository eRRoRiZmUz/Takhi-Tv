const express = require("express");
const router = express.Router();
const auth = require("../auth/auth");
const user = require("../controllers/user.js");

router.post("/api/user/login", auth.optional, user.login);
router.post("/api/user/registration", auth.optional, user.registration);
router.post("/api/user/Order", auth.optional, user.Order);
router.post("/api/user/comments", auth.optional, user.comments);
router.post("/api/user/getComments", auth.optional, user.getComments);
router.post("/api/user/deleteComment", auth.optional, user.deleteComment);
router.post("/api/user/editComment", auth.optional, user.editComment);
router.post("/api/user/changePassword", auth.optional, user.changePassword);
router.post("/api/user/forgotPassword", auth.optional, user.forgotPassword);
// oauth
router.get("/api/user/facebook", passport.authenticate("facebook"), function (
  req,
  res
) {
  // The request will be redirected to Facebook for authentication, so this
  // function will not be called.
});
router.get(
  "/api/user/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/",
    scope: ["emails"],
  }),
  function (req, res) {
    res.redirect("/");
  }
);

module.exports = router;
