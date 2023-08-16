const express = require("express");
const {
  addNewAddress,
  getAllAddress,
} = require("../controller/addressController");
const { checkLogin } = require("../middleware/checkLogin");
const addressRoute = express();

addressRoute.post("/add-new-address", checkLogin, addNewAddress);
addressRoute.get("/get-addresses", checkLogin, getAllAddress);

module.exports = addressRoute;
