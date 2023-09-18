const Address = require("../models/address");

const addNewAddress = async (req, res) => {
  try {
    const company = req.body.companyName;
    const address = req.body.address;
    const tel = req.body.tel;
    const gstNo = req.body.gstNo;

    if (address.length === 0 || tel.length === 0 || gstNo.length === 0) {
      res.status(400).send({ msg: "Please enter all details" });
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
          res.status(200).send({ msg: "success", AddressData: toSaveData });
        } else {
          res.status(400).send({ msg: "Something went wrong in data!!" });
        }
      } else {
        res.status(400).send({ msg: "This gstNo has already added !!!" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

//Get all address list
const getAllAddress = async (req, res) => {
  try {
    const addressData = await Address.find();
    if (addressData.length > 0) {
      res.status(200).send({ msg: "Success", addressData: addressData });
    } else {
      res.status(400).send({ msg: "No Data available" });
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { addNewAddress, getAllAddress };
