const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    //   required: true,
  },
  tel: {
    type: String,
    //   required: true,
  },
  gstNo: {
    type: String,
    //   required: true,
  },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
