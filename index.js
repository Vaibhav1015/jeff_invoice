const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(bodyParser.json());
// Middleware to parse JSON in request body
app.use(express.json());
const { baseUrl } = require("./static/variables");
//Swagger api docs file setup
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

app.use(
  `${baseUrl}/api-docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

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
app.use(baseUrl, invoiceRoute);

const addressRoute = require("./router/addressRouter");
app.use(baseUrl, addressRoute);

const userRoute = require("./router/userRouter");
app.use(baseUrl, userRoute);

app.use("/", (req, resp) => resp.json("My API running 😎"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
