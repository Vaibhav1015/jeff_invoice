const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(bodyParser.json());
// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB (Replace 'mongodb://localhost/bill-receipt' with your MongoDB connection string)
mongoose
  .connect(
    "mongodb+srv://vaibhav10:Vaibhav1015@cluster0.on5gazj.mongodb.net/bill-receipt?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

const invoiceRoute = require("./router/invoiceRouter");
app.use("/", invoiceRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
