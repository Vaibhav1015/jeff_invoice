const express = require("express");
const {
  addNewAddress,
  getAllAddress,
} = require("../controller/addressController");
const addressRoute = express();

addressRoute.post("/add-new-address", addNewAddress);
addressRoute.get("/get-addresses", getAllAddress);

module.exports = addressRoute;
