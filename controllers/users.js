const User = require("../models/users");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");

const { SECRET_KEY } = process.env;

const Schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(email);

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

    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      avatarURL,
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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Email or password is wrong" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(401).json({ error: "Email or password is wrong" });
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({ token: token });
  } catch (error) {
    next(error);
  }
};

const current = async (req, res, next) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json({ message: "No Content" });
  } catch (error) {
    next(error);
  }
};

const subscription = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const validSubscriptions = ["starter", "pro", "business"];

    if (!validSubscriptions.includes(subscription)) {
      const error = new Error("Invalid subscription value");
      error.status = 400;
      throw error;
    }

    const { userId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true }
    );

    if (!updatedUser) {
      const error = new Error(`User with ID ${userId} not found`);
      error.status = 404;
      throw error;
    }

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { path: tempUpload, originalname } = req.file;

    const fileName = `${userId}_${originalname}`;

    const resultUpload = path.join(avatarDir, fileName);

    Jimp.read(tempUpload)
      .then((image) => {
        return image.resize(250, 250).write(resultUpload);
      })
      .then(() => {
        fs.unlink(tempUpload, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });

    const avatarURL = path.join("avatars", fileName);
    await User.findByIdAndUpdate(userId, { avatarURL });
    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  current,
  logout,
  subscription,
  updateAvatar,
};
