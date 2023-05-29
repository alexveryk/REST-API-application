const express = require("express");

const router = express.Router();

const controller = require("../../controllers/users");

const { authentication } = require("../../middleware/authentication");

router.post("/register", controller.register);

router.post("/login", controller.login);

router.get("/current", authentication, controller.current);

router.post("/logout", authentication, controller.logout);

module.exports = router;
