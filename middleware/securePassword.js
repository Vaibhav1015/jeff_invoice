const bcryptjs = require("bcryptjs");

// For Bcrypt password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.send(error.message);
  }
};

module.exports = securePassword;
