const securePassword = require("../middleware/securePassword");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register New User

const registerUser = async (req, res) => {
  try {
    const fullName = req.body.fullName;
    const phoneNo = req.body.phoneNo;
    const password = req.body.password;
    const hashPassword = await securePassword(password);

    if (!fullName || !phoneNo || !password) {
      res.status(400).send({ msg: "Enter valid inputs" });
    } else {
      const newUser = new User({
        fullName,
        phoneNo,
        password: hashPassword,
      });
      if (newUser) {
        const toSaveUser = await newUser.save();
        res.status(200).send({ msg: "success", userData: toSaveUser });
      } else {
        res.status(500).send({ msg: "Try again later..!!" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

//Login

const userLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const checkPhone = await User.findOne(
      { phoneNo: phone },
      { fullName: 1, phoneNo: 1, password: 1 }
    );

    if (checkPhone) {
      const checkPassword = await bcryptjs.compare(
        password,
        checkPhone.password
      );
      if (checkPassword) {
        const loginToken = jwt.sign({ checkPhone }, process.env.JWT_SECRET);
        const userUpdateData = await User.findOneAndUpdate(
          { phoneNo: phone },
          { $push: { authToken: loginToken } }
        );
        if (userUpdateData) {
          const updatedData = await User.findOne(
            { phoneNo: phone },
            { authToken: 1 }
          );
          res.status(200).send({
            meta: {
              status: true,
              statusCode: 200,
              message: "success",
            },
            values: updatedData.authToken.slice(-1),
          });
        }
      } else {
        res.status(400).send({
          status: false,
          statusCode: 400,
          message: "Check your credentials",
        });
      }
    } else {
      res.status(400).send({
        status: false,
        statusCode: 400,
        message: "Check your credentials",
      });
    }
  } catch (error) {
    res.send(error.message);
  }
};

//Logout

const userLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.slice(7);
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        _id: decoded.checkPhone._id,
      });
      if (!user) {
        res.status(401).send({ message: "User not found" });
      } else {
        user.authToken = user.authToken.filter((e) => e !== token);
        await user.save();
        res.status(200).send({ message: "Logout successful..!!" });
      }
    }
  } catch (error) {
    res.send(error.message);
  }
};

module.exports = { registerUser, userLogin, userLogout };
