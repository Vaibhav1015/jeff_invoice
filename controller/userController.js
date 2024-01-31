const {
  isValidEmail,
  isValidPassword,
  securePassword,
} = require("../middleware/validation");
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
    const email = req.body.email;

    if (!fullName || !phoneNo || !password || !email) {
      res.status(400).send({
        meta: {
          status: false,
          statusCode: 400,
          message: "Invalid inputs",
        },
      });
    } else if (phoneNo.length === 0) {
      res.status(400).send({
        meta: {
          status: false,
          statusCode: 400,
          message: "Please enter your mobile number",
        },
      });
    } else if (phoneNo.length !== 10) {
      res.status(400).send({
        meta: {
          status: false,
          statusCode: 400,
          message: "The mobile number must be 10 digits",
        },
      });
    } else if (isNaN(phoneNo)) {
      res.status(400).send({
        meta: {
          status: false,
          statusCode: 400,
          message: "Please enter valid mobile number",
        },
      });
    } else if (email.length === 0) {
      return res.status(400).json({
        meta: {
          status: false,
          statusCode: 400,
          message: "Please enter your email",
        },
      });
    } else if (!isValidEmail(email)) {
      return res.status(400).json({
        meta: {
          status: false,
          statusCode: 400,
          message: "Invalid email format",
        },
      });
    } else if (password.length === 0) {
      return res.status(400).json({
        meta: {
          status: false,
          statusCode: 400,
          message: "Please enter your password",
        },
      });
    } else if (!isValidPassword(password)) {
      return res.status(400).json({
        meta: {
          status: false,
          statusCode: 400,
          message:
            "Password must be at least 8 characters long, at most 16 characters long, and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
        },
      });
    } else {
      const hashPassword = await securePassword(password);
      const newUser = new User({
        fullName,
        phoneNo,
        password: hashPassword,
      });
      if (newUser) {
        const toSaveUser = await newUser.save();
        res.status(200).send({
          meta: {
            status: true,
            statusCode: 200,
            message: "success",
          },
          values: toSaveUser,
        });
      } else {
        res.status(400).send({
          meta: {
            status: false,
            statusCode: 400,
            message: "Try again later..!!",
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
          const data = updatedData.authToken.slice(-1);

          // Create an object with a "values" property and assign the string as a value
          const dataObject = {
            values: data[0],
          };

          // You can now use dataObject as needed in your JavaScript code
          const resData = {
            authToken: dataObject.values,
          };

          res.status(200).send({
            meta: {
              status: true,
              statusCode: 200,
              message: "success",
            },
            values: resData,
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
    res.status(500).send({
      status: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

//Logout

const userLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.slice(7);
    if (!token) {
      return res.status(401).send({
        status: false,
        statusCode: 401,
        message: "Authorization token missing",
      });
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        _id: decoded.checkPhone._id,
      });
      if (!user) {
        res.status(401).send({
          status: false,
          statusCode: 401,
          message: "User not found",
        });
      } else {
        user.authToken = user.authToken.filter((e) => e !== token);
        await user.save();
        res.status(200).send({
          status: true,
          statusCode: 200,
          message: "Logout successful..!!",
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

module.exports = { registerUser, userLogin, userLogout };
