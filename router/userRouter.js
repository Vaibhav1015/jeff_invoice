const express = require("express");
const {
  registerUser,
  userLogin,
  userLogout,
} = require("../controller/userController");
const userRoutes = express();

userRoutes.post("/register-user", registerUser);
userRoutes.post("/login", userLogin);
userRoutes.post("/logout", userLogout);

module.exports = userRoutes;
