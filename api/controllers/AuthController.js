/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require("bcrypt");
const toJSON = require("to-json");
const jwt = require("jsonwebtoken");

const { setMaxListeners } = require("process");

module.exports = {
  login: async function (req, res) {
    if (!req.body.email || !req.body.password) {
      return res.badRequest({
        err: "User or password cannot be empty",
      });
    }
    const user = await User.find({
      where: { email: req.param("email") },
    });
    if (!user.length) {
      return res.badRequest({ response: [], message: "username not found" });
    } else {
      //Compare the password
      const match = await bcrypt.compare(
        req.param("password"),
        user[0].password
      );
      if (match) {
        const payload = toJSON(user[0]);
        const token = jwt.sign(payload, "c42f173100b5a1cc5a4ca2a5", {
          expiresIn: "180 days",
        });
        if (!req.body.token) {
          const tokens = user[0].deviceToken ? user[0].deviceToken : [];
          tokens.push(token);
          await User.update({ id: user[0].id }, { deviceToken: tokens });
        }
        res.json({ token: token, user });
      } else {
        return res.badRequest({
          response: [],
          message: "username password not found",
        });
      }
    }
  },

  // Register Function

  register: function (req, res) {
    // form validations here

    if (_.isUndefined(req.param("email"))) {
      return res.badRequest("An email address is required.");
    }

    if (_.isUndefined(req.param("password"))) {
      return res.badRequest("A password is required.");
    }

    if (req.param("password").length < 8) {
      return res.badRequest("Password must be at least 8 characters.");
    }

    if (_.isUndefined(req.param("username"))) {
      return res.badRequest("A username is required.");
    }

    if (
      req.param("phone_no").length < 10 &&
      _.isNumber(req.param("phone_no"))
    ) {
      return res.badRequest(
        "Phone No. Should be of 10 digits &  contain only numbers"
      );
    }

    data = {
      username: req.body.username.toLowerCase(),
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      phoneNo: req.body.phone_no,
    };

    User.create(data)
      .fetch()
      .exec(function (err, user) {
        if (err) return res.negotiate(err);

        // redirect goes here
        res.json({ message: "User Registered Successfully Please Login" });
      });
  },

  // Get user Details

  details: async function (req, res) {
    const email = req.user.email;

    if (!email) {
      return res.json({ message: "No user found" });
    }

    const user = await User.find({
      where: { email: email },
    });

    res.json(user);
  },

  // Update user details

  update: async function (req, res) {
    const id = req.user.id;
    const user = await User.find({
      where: { id: id },
    });

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const phoneNo = req.body.phone_no;

    if (!user.length) {
      return res.badRequest({ message: "user not found" });
    } else {
      await User.update(
        { id: id },
        {
          email: email,
          username: username,
          phoneNo: phoneNo,
          password: password,
        }
      ).exec(function (err) {
        if (err) {
          res.send(500, { error: "Database Error" });
        }

        res.json({ message: "User Details Updated Successfully" });
      });
      return false;
    }
  },

  // upload profile image
  uploadFile: async function (req, res) {
    const file = await sails.helpers.fileUpload(req, res);
    if (!file) {
      res.badRequest({ message: "file not uploaded" });
    } else {
      res.json({ status: "file upload successfully", file });
    }
  },

  // logout user
  logout: function (req, res) {
    res.clearCookie("sailsjwt");
    req.user = null;
    return res.ok();
  },
};
