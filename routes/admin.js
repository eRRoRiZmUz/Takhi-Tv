const express = require("express");
const router = express.Router();
const auth = require("../auth/auth");
const admin = require("../admin/admin");

router.post("/api/admin/SeeOrders", auth.optional, admin.SeeOrders);
router.post("/api/admin/sendEmail", auth.optional, admin.sendEmail);
router.post("/api/admin/Post", auth.optional, admin.Post);
router.post("/api/admin/temporaryPass", auth.optional, admin.temporaryPass);
router.post("/api/admin/deletePost", auth.optional, admin.deletePost);

module.exports = router;
