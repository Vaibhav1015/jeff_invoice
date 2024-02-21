const mongoose = require("mongoose");
const moment = require("moment-timezone");

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
    createdAt: {
      type: String,
      default: () => moment.utc().tz("Asia/Kolkata").format(),
    },
  },
  { versionKey: false }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
