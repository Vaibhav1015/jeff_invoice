const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3000;
app.use(bodyParser.json());

// Connect to MongoDB (Replace 'mongodb://localhost/bill-receipt' with your MongoDB connection string)
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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

// API endpoint to generate and download the bill receipt PDF
app.get("/generateBillPDF/:billId", async (req, res) => {
  try {
    const billId = req.params.billId;
    const bill = await Bill.findOne({ _id: billId });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    const html = await ejs.renderFile("templates/index.ejs", {
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
    });

    const browser = await puppeteer.launch({
      headless: "new", // Opt-in to the new Headless mode
    });
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    const pdfFileName = `bill_receipt_${billId}.pdf`;
    fs.writeFileSync(`public/${pdfFileName}`, pdfBuffer);

    return res.json({
      message: "PDF generated successfully",
      pdfUrl: `/download/${pdfFileName}`,
    });
  } catch (err) {
    console.error("Error generating PDF:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// Serve the PDF files
app.use("/download", express.static("public"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
