const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
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
  items: [{
    description: {
      type: String,
    //   required: true,
    },
    hsnCode: {
      type: String,
    },
    quantity: {
      type: String,
    //   required: true,
    },
    rate: {
      type: Number,
    //   required: true,
    },
    amount: {
      type: Number,
    //   required: true,
    },
  }],
  netTotal: {
    type: Number,
    // required: true,
  },
  cGst: {
    type: Number,
    // required: true,
  },
  sGst: {
    type: Number,
    // required: true,
  },
  iGst: {
    type: Number,
    // required: true,
  },
  grandTotal: {
    type: Number,
    // required: true,
  },
  totalAmountInWords: {
    type: String,
    // required: true,
  }
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
