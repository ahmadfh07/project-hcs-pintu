const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },

  noHp: {
    type: String,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    maxlength: 255,
  },

  //   role: {
  //     type: String,
  //     default: "User",
  //   },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
