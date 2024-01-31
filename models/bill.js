const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invoiceNo: {
      type: String,
    },
    challanNo: {
      type: String,
    },
    pOrderNo: {
      type: String,
    },
    invoiceDate: {
      type: Date,
    },
    challanDate: {
      type: Date,
    },
    pOrderDate: {
      type: Date,
    },
    billingAddress: {
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
    deliveryAddress: {
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
    items: [
      {
        description: {
          type: String,
          //   required: true,
        },
        hsnCode: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          //   required: true,
          default: 0,
        },
      },
    ],
    netTotal: {
      type: Number,
      // required: true,
      default: 0,
    },
    cGst: {
      type: Number,
      // required: true,
      default: 0,
    },
    sGst: {
      type: Number,
      // required: true,
      default: 0,
    },
    iGst: {
      type: Number,
      // required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      // required: true,
    },
    totalAmountInWords: {
      type: String,
      // required: true,
    },
  },
  { versionKey: false }
);

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;
