const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.slice(7);

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key

    const user = await User.findOne({
      _id: decoded.checkPhone._id,
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { checkLogin };
