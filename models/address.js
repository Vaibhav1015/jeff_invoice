const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    companyName: {
      type: String,
    },
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
  },
  { versionKey: false }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
