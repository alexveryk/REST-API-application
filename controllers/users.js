const User = require("../models/users");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const Schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = Schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ error: "Email in use" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {};

module.exports = {
  register,
  login,
};
