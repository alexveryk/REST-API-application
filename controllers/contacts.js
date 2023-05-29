const Contact = require("../models/contact");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
    .required(),
  favorite: Joi.boolean(),
});

const favoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const getAll = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const result = await Contact.find({ owner }, "", { skip, limit });
    console.log("ALL");
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findOne({ _id: contactId });

    if (!result) {
      const error = new Error(`Contact width: ${contactId} not found`);
      error.status = 404;
      throw error;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    console.log(req.user);
    const { _id: owner } = req.user;
    console.log("owner", owner);

    const errorValidate = schema.validate(req.body);

    if (errorValidate.error) {
      console.log();
      const error = new Error("missing required name field");
      error.status = 400;
      throw error;
    }

    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndDelete(contactId);

    if (!result) {
      const error = new Error(`Contact width: ${contactId} not found`);
      error.status = 404;
      throw error;
    }

    res.send("contact deleted");
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const errorValidate = schema.validate(req.body);
    if (errorValidate.error) {
      const error = new Error("missing required name field");
      error.status = 400;
      throw error;
    }
    const { contactId } = req.params;

    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });

    if (!result) {
      const error = new Error(`Contact width: ${contactId} not found`);
      error.status = 404;
      throw error;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const errorValidate = favoriteSchema.validate(req.body);

    if (errorValidate.error) {
      const error = new Error("missing required name field");
      error.status = 400;
      throw error;
    }
    const { contactId } = req.params;

    const result = await Contact.findByIdAndUpdate(contactId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, remove, update, updateStatus };
