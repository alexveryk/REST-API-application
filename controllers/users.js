const User = require("../models/users");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
const sendEmail = require("../helpers/sendEmail");

const { SECRET_KEY, BASE_URL } = process.env;

const Schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const ResendingSchema = Joi.object({
  email: Joi.string().email().required(),
});

const avatarDir = path.join(__dirname, "../", "public", "avatars");

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

    const avatarURL = gravatar.url(email);

    const verificationToken = nanoid();

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click here to verify your email</a>`,
    };

    sendEmail(verifyEmail);

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

const verification = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });
    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const verificationResending = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { error } = ResendingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: "missing required field email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Not Found" });
    }

    if (user.verify) {
      return res.status(400).verifica.verificationToken.json({
        error: "Verification has already been passed",
      });
    }

    const verifyEmail = {
      to: email,
      subject: "Resending Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click here to verify your email</a>`,
    };

    sendEmail(verifyEmail);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, verify } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Email or password is wrong" });
    }

    if (!user.verify) {
      return res.status(403).json({ error: "Email is not verified" });
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
  verification,
  verificationResending,
};
