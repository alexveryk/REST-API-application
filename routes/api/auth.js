const express = require("express");

const router = express.Router();

const controller = require("../../controllers/users");

const { authentication } = require("../../middleware/authentication");

const upload = require("../../middleware/upload");

router.post("/register", controller.register);

router.get("/verify/:verificationToken", controller.verification);

router.post("/verify", controller.verificationResending);

router.post("/login", controller.login);

router.get("/current", authentication, controller.current);

router.post("/logout", authentication, controller.logout);

router.patch(
  "/avatars",
  authentication,
  upload.single("avatar"),
  controller.updateAvatar
);

router.patch("/:userId", authentication, controller.subscription);

module.exports = router;
