const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;
app.use(bodyParser.json());

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
const Bill = require("./models/bill"); // Assuming you have a Bill model for MongoDB
const { price_in_words } = require("./numberToWords");

// Middleware to parse JSON in request body
app.use(express.json());

// post api new invoice
app.post("/add_new_invoice", async (req, res) => {
  try {
    const billingAddress = req.body.billingAddress;
    const deliveryAddress = req.body.deliveryAddress;
    const items = req.body.items;
    items.forEach((item) => {
      item.amount = item.rate * item.quantity;
    });

    const netTotalAmount = items.reduce(
      (total, item) => total + item.amount,
      0
    );
    const netTotal = netTotalAmount;
    const percentCGst = req.query.cGst;
    const percentSGst = req.query.sGst;
    const percentIGst = req.query.iGst;
    const totalCGst = Math.ceil(
      (netTotal / 100) * (percentCGst ? percentCGst : 0)
    );
    const totalSGst = Math.ceil(
      (netTotal / 100) * (percentSGst ? percentSGst : 0)
    );
    const totalIGst = Math.ceil(
      (netTotal / 100) * (percentIGst ? percentIGst : 0)
    );
    const grandTotal = netTotal + totalCGst + totalIGst + totalSGst;
    const totalAmountInWords = price_in_words(grandTotal);
    const dataInvoice = new Bill({
      billingAddress: billingAddress,
      deliveryAddress: deliveryAddress,
      items: items,
      netTotal: netTotal,
      cGst: totalCGst,
      sGst: totalSGst,
      iGst: totalIGst,
      grandTotal: grandTotal,
      totalAmountInWords: totalAmountInWords,
    });
    if (dataInvoice) {
      const saveData = dataInvoice.save();
      res.status(200).send({ msg: "success", invoice: dataInvoice });
    } else {
      res.status(400).send({ msg: "Something went wrong!!" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// new code
process.env["OPENSSL_CONF"] = path.resolve(
  __dirname,
  "C:/Users/ETPL-08/Downloads/PortableGit/usr/ssl/openssl.cnf"
);
app.get("/generate-invoice/:billId", async (req, res) => {
  try {
    const billId = req.params.billId;
    const bill = await Bill.findOne({ _id: billId });
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    const templatePath = path.join(__dirname, "templates/index.ejs");
    const templateData = {
      // Add your data here to replace the placeholders in the template
      // ... (your existing data)
      deliveryAddress: bill.deliveryAddress.address,
      deliveryTel: bill.deliveryAddress.tel,
      deliveryGst: bill.deliveryAddress.gstNo,
      billingAddress: bill.billingAddress.address,
      billingTel: bill.billingAddress.tel,
      billingGst: bill.billingAddress.gstNo,
      items: bill.items,
      netTotal: bill.netTotal,
      grandTotal: bill.grandTotal,
      cGst: bill.cGst,
      iGst: bill.iGst,
      sGst: bill.sGst,
      totalAmountInWords: bill.totalAmountInWords,
    };

    const html = await ejs.renderFile(templatePath, templateData);

    // PDF options
    const options = {
      format: "Letter", // or "Letter" for US Letter size
    };

    pdf
      .create(html, options)
      .toFile("public/output.pdf", function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send("An error occurred while generating the PDF.");
        } else {
          const pdfLink = `<a href="/download-pdf">Download Invoice Bill PDF</a>`;
          res.send(pdfLink);
        }
      });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while generating the PDF.");
  }
});

app.get("/download-pdf", (req, res) => {
  try {
    const pdfPath = path.join(__dirname, "public/output.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
    fs.createReadStream(pdfPath).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while downloading the PDF.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
