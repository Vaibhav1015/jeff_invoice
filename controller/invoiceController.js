const Bill = require("../models/bill");
const { price_in_words } = require("../middleware/numberToWords");
require("dotenv").config();
const path = require("path");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");

// To add new invoice
const addNewInvoice = async (req, res) => {
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
      invoiceNo: req.body.invoiceNo,
      challanNo: req.body.challanNo,
      pOrderNo: req.body.pOrderNo,
      invoiceDate: req.body.invoiceDate,
      challanDate: req.body.challanDate,
      pOrderDate: req.body.pOrderDate,
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
};

//resolve ssl
process.env["OPENSSL_CONF"] = path.resolve(
  __dirname,
  "C:/Users/ETPL-08/Downloads/PortableGit/usr/ssl/openssl.cnf"
);

// Date Conversion fn
const convDate = (newDate) => {
  return new Date(newDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};
//To Generate pdf get request
const getInvoicePdf = async (req, res) => {
  try {
    const billId = req.params.billId;
    const bill = await Bill.findOne({ _id: billId });
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    const templatePath = path.join(__dirname, "../templates/index.ejs");

    const templateData = {
      // Add your data here to replace the placeholders in the template
      // ... (your existing data)
      invoiceNo: bill.invoiceNo,
      challanNo: bill.challanNo,
      pOrderNo: bill.pOrderNo,
      invoiceDate: convDate(bill.invoiceDate),
      challanDate: convDate(bill.challanDate),
      pOrderDate: convDate(bill.pOrderDate),
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
    const pdfFileName = `invoice_${bill.invoiceNo}.pdf`;

    pdf
      .create(html, options)
      .toFile(`public/${pdfFileName}`, function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send("An error occurred while generating the PDF.");
        } else {
          const pdfLink = `<a href="/download-pdf/${pdfFileName}">Download Invoice Bill PDF</a>`;
          res.send(pdfLink);
        }
      });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while generating the PDF.");
  }
};

//To download the pdf
const downloadPdf = async (req, res) => {
  try {
    const pdfFileName = req.params.fileName;
    const pdfPath = path.join(__dirname, `../public/${pdfFileName}`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=output.pdf`);
    fs.createReadStream(pdfPath).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while downloading the PDF.");
  }
};

module.exports = {
  addNewInvoice,
  getInvoicePdf,
  downloadPdf,
};
