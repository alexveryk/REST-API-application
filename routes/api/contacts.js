const express = require("express");
const Joi = require("joi");

const contactService = require("../../models/contacts");

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
    .required(),
});

router.get("/", async (req, res, next) => {
  try {
    const result = await contactService.listContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactService.getContactById(contactId);

    if (!result) {
      const error = new Error(`Contact width: ${contactId} not found`);
      error.status = 404;
      throw error;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const errorValidate = schema.validate(req.body);
    if (errorValidate.error) {
      const error = new Error("missing required name field");
      error.status = 400;
      throw error;
    }

    const result = await contactService.addContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactService.removeContact(contactId);

    if (!result) {
      const error = new Error(`Contact width: ${contactId} not found`);
      error.status = 404;
      throw error;
    }

    res.send("contact deleted");
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const errorValidate = schema.validate(req.body);
    if (errorValidate.error) {
      const error = new Error("missing required name field");
      error.status = 400;
      throw error;
    }
    const { contactId } = req.params;

    const result = await contactService.updateContact(contactId, req.body);
    console.log("result", result);
    if (!result) {
      const error = new Error(`Contact width: ${contactId} not found`);
      error.status = 404;
      throw error;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
