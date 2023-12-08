const Address = require("../models/address");

const addNewAddress = async (req, res) => {
  try {
    const company = req.body.companyName;
    const address = req.body.address;
    const tel = req.body.tel;
    const gstNo = req.body.gstNo;

    if (address.length === 0 || tel.length === 0 || gstNo.length === 0) {
      res.status(400).send({
        meta: {
          status: false,
          statusCode: 400,
          message: "Please enter all details",
        },
      });
    } else {
      const checkAlreadyGstNoBilling = await Address.find({ gstNo: gstNo });

      const newAddress = new Address({
        companyName: company,
        address: address,
        tel: tel,
        gstNo: gstNo,
      });

      if (checkAlreadyGstNoBilling.length === 0) {
        if (newAddress) {
          const toSaveData = await newAddress.save();
          res.status(200).send({
            meta: {
              status: true,
              statusCode: 200,
              message: "success",
            },
            values: toSaveData,
          });
        } else {
          res.status(400).send({
            meta: {
              status: false,
              statusCode: 400,
              message: "Something went wrong in data!!",
            },
          });
        }
      } else {
        res.status(400).send({
          meta: {
            status: false,
            statusCode: 400,
            message: "This gstNo has already added !!!",
          },
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      meta: {
        status: false,
        statusCode: 500,
        message: error.message,
      },
    });
  }
};

//Get all address list
const getAllAddress = async (req, res) => {
  try {
    const addressData = await Address.find();
    if (addressData.length > 0) {
      res.status(200).send({
        meta: {
          status: true,
          statusCode: 200,
          message: "success",
        },
        values: addressData,
      });
    } else {
      res.status(400).send({
        meta: {
          status: false,
          statusCode: 400,
          message: "No Data available",
        },
      });
    }
  } catch (error) {
    res.status(500).send({
      meta: {
        status: false,
        statusCode: 500,
        message: error.message,
      },
    });
  }
};

module.exports = { addNewAddress, getAllAddress };
