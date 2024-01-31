const bcryptjs = require("bcryptjs");

// For Bcrypt password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(500).send({
      status: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  // Password must be at least 8 characters long, at most 16 characters long, and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  return passwordRegex.test(password);
}

module.exports = { isValidEmail, isValidPassword, securePassword };
