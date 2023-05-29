const express = require("express");

const controllers = require("../../controllers/contacts");

const { authentication } = require("../../middleware/authentication");

const router = express.Router();

router.use(authentication);

router.get("/", controllers.getAll);

router.get("/:contactId", controllers.getById);

router.post("/", controllers.create);

router.delete("/:contactId", controllers.remove);

router.put("/:contactId", controllers.update);

router.patch("/:contactId/favorite", controllers.updateStatus);

module.exports = router;
