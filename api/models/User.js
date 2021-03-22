/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const bcrypt = require("bcrypt");

module.exports = {
  tableName: "users",

  attributes: {
    username: {
      type: "string",
      required: true,
    },

    email: {
      type: "string",
      required: true,
      unique: true,
      isEmail: true,
    },

    password: {
      type: "string",
      required: true,
      protect: true,
    },

    phoneNo: {
      type: "number",
      required: true,
      unique: true,
    },
    profileImage: {
      type: "string",
    },

    deviceToken: {
      type: "json",
    },
  },

  customToJSON: function () {
    return _.omit(this, ["password"]);
  },

  beforeCreate: function (values, cb) {
    // Hash password
    bcrypt.hash(values.password, 10, function (err, hash) {
      if (err) {
        return cb(err);
      }
      //Delete the passwords so that they are not stored in the DB
      delete values.password;

      values.password = hash;

      //calling cb() with an argument returns an error. Useful for canceling the entire operation if some criteria fails.
      cb();
    });
  },
};
