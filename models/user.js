const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  authToken: {
    type: Array,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
