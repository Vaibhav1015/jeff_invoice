const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const ejs = require("ejs");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;
app.use(bodyParser.json());

// Connect to MongoDB (Replace 'mongodb://localhost/bill-receipt' with your MongoDB connection string)
mongoose.connect(
  "mongodb+srv://vaibhav10:Vaibhav1015@cluster0.on5gazj.mongodb.net/bill-receipt?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
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

// Multer configuration for file upload
// const storage = multer.diskStorage({
//   destination: "public", // File destination directory
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const extname = path.extname(file.originalname);
//     cb(null, "bill_receipt_" + uniqueSuffix + extname);
//   },
// });

// const upload = multer({ storage });

// API endpoint to generate and download the bill receipt PDF
// app.get("/generateBillPDF/:billId", async (req, res) => {
//   try {
//     const billId = req.params.billId;
//     const bill = await Bill.findOne({ _id: billId });

//     if (!bill) {
//       return res.status(404).json({ error: "Bill not found" });
//     }

//     const html = await ejs.renderFile("templates/index.ejs", {
//       deliveryAddress: bill.deliveryAddress.address,
//       deliveryTel: bill.deliveryAddress.tel,
//       deliveryGst: bill.deliveryAddress.gstNo,
//       billingAddress: bill.billingAddress.address,
//       billingTel: bill.billingAddress.tel,
//       billingGst: bill.billingAddress.gstNo,
//       items: bill.items,
//       netTotal: bill.netTotal,
//       grandTotal: bill.grandTotal,
//       cGst: bill.cGst,
//       iGst: bill.iGst,
//       sGst: bill.sGst,
//       totalAmountInWords: bill.totalAmountInWords,
//     });

//     const browser = await puppeteer.launch({
//       headless: "new", // Opt-in to the new Headless mode
//     });
//     const page = await browser.newPage();

//     await page.setContent(html, {
//       waitUntil: "domcontentloaded",
//     });

//     const pdfBuffer = await page.pdf({ format: "A4" });
//     await browser.close();

//     const pdfFileName = `bill_receipt_${billId}.pdf`;
//     fs.writeFileSync(`public/${pdfFileName}`, pdfBuffer);

//     return res.json({
//       message: "PDF generated successfully",
//       pdfUrl: `https://invoice-bill.onrender.com/download/${pdfFileName}`,
//     });
//   } catch (err) {
//     console.error("Error generating PDF:", err);
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });

// app.get("/generateBillPDF/:billId", async (req, res) => {
//   try {
//     const billId = req.params.billId;
//     const bill = await Bill.findOne({ _id: billId });

//     if (!bill) {
//       return res.status(404).json({ error: "Bill not found" });
//     }

//     const html = await ejs.renderFile("templates/index.ejs", {
//       deliveryAddress: bill.deliveryAddress.address,
//       deliveryTel: bill.deliveryAddress.tel,
//       deliveryGst: bill.deliveryAddress.gstNo,
//       billingAddress: bill.billingAddress.address,
//       billingTel: bill.billingAddress.tel,
//       billingGst: bill.billingAddress.gstNo,
//       items: bill.items,
//       netTotal: bill.netTotal,
//       grandTotal: bill.grandTotal,
//       cGst: bill.cGst,
//       iGst: bill.iGst,
//       sGst: bill.sGst,
//       totalAmountInWords: bill.totalAmountInWords,
//     });

//     const browser = await puppeteer.launch({
//       headless: "new", // Opt-in to the new Headless mode
//       executablePath: "/path/to/chrome",
//     });
//     const page = await browser.newPage();

//     await page.setContent(html, {
//       waitUntil: "domcontentloaded",
//     });

//     const pdfBuffer = await page.pdf({ format: "A4" });
//     await browser.close();

//     // Save the PDF using multer and path
//     const pdfFileName = `bill_receipt_${billId}.pdf`;
//     const pdfPath = path.join("public", pdfFileName);

//     fs.writeFile(pdfPath, pdfBuffer, async (err) => {
//       if (err) {
//         console.error("Error generating PDF:", err);
//         return res.status(500).json({ error: "Something went wrong" });
//       }

//       return res.json({
//         message: "PDF generated successfully",
//         pdfUrl: `/public/${pdfFileName}`,
//       });
//     });
//   } catch (err) {
//     console.error("Error generating PDF:", err);
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });
// process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, "puppeteer-cache");
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
    const pdfPath = path.join(__dirname, "public/output.pdf");
    // const puppeteerOptions = {
    //   headless: "new", // Opt-in to the new Headless mode
    //   userDataDir: process.env.PUPPETEER_CACHE_DIR,
    // };
    const browser = await puppeteerExtra.launch({
      headless: "new",
    });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
    await browser.close();

    const pdfLink = `<a href="/download-pdf">Download Invoice Bill PDF</a>`;
    res.send(pdfLink);
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
    console.error(err);
    res.status(500).send("An error occurred while download the PDF.");
  }
});

// Serve the PDF files
// app.use("/public", express.static(path.join(__dirname, "public")));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
