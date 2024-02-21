const Bill = require("../models/bill");
const { price_in_words } = require("../middleware/numberToWords");
require("dotenv").config();
const path = require("path");
const ejs = require("ejs");
const pdf = require("html-pdf");
const puppeteer = require("puppeteer");
const fs = require("fs");
const User = require("../models/user");

// To add new invoice
const addNewInvoice = async (req, res) => {
  try {
    const userId = req.body.userId;
    const billingAddress = req.body.billingAddress;
    const deliveryAddress = req.body.deliveryAddress;
    const items = req.body.items;
    const isValidUser = await User.findById(userId);

    if (isValidUser) {
      items.forEach((item) => {
        item.amount = item.rate * item.quantity;
      });

      const netTotalAmount = items.reduce(
        (total, item) => total + item.amount,
        0
      );
      const netTotal = netTotalAmount;
      const percentCGst = req.body.cGst;
      const percentSGst = req.body.sGst;
      const percentIGst = req.body.iGst;
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
        userId: userId,
        invoiceNo: req.body.invoiceNo,
        challanNo: req.body.challanNo,
        pOrderNo: req.body.pOrderNo,
        invoiceDate: req.body.invoiceDate,
        challanDate: req.body.challanDate,
        pOrderDate: req.body.pOrderDate,
        pOrderDate2: req.body.pOrderDate2,
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
        await dataInvoice.save();
        res.status(200).send({
          meta: {
            status: true,
            statusCode: 200,
            message: "success",
          },
          values: dataInvoice,
        });
      } else {
        res.status(400).send({
          meta: {
            status: false,
            statusCode: 400,
            message: "Something went wrong.!!",
          },
        });
      }
    } else {
      res.status(400).send({
        meta: {
          status: false,
          statusCode: 400,
          message: "User not found",
        },
      });
    }
  } catch (error) {
    return res.status(500).send({
      meta: {
        status: false,
        statusCode: 500,
        message: "Internal server error",
      },
    });
  }
};

//resolve ssl
process.env["OPENSSL_CONF"] = path.resolve(
  __dirname,
  "C:/Users/ETPL-08/Downloads/PortableGit/usr/ssl/openssl.cnf"
);

// Date Conversion fn
const convertDate = (newDate) => {
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

    const isAvailablePOrderDate2 = bill.pOrderDate2;

    console.log(isAvailablePOrderDate2, "<<<<<<orderDate");

    let pOrderDateSecond = convertDate(isAvailablePOrderDate2);

    if (!isAvailablePOrderDate2 || isAvailablePOrderDate2 === undefined) {
      pOrderDateSecond = undefined;
    }

    console.log(pOrderDateSecond, "<<<<<let porder date");

    const templatePath = path.join(__dirname, "../templates/index.ejs");

    const templateData = {
      // Add your data here to replace the placeholders in the template
      invoiceNo: bill.invoiceNo,
      challanNo: bill.challanNo,
      pOrderNo: bill.pOrderNo,
      invoiceDate: convertDate(bill.invoiceDate),
      challanDate: convertDate(bill.challanDate),
      pOrderDate: convertDate(bill.pOrderDate),
      pOrderDate2: pOrderDateSecond,
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

    // const html = await ejs.renderFile(templatePath, templateData);

    // // PDF options
    // const options = {
    //   format: "Letter", // or "Letter" for US Letter size
    // };
    // const pdfFileName = `invoice_${bill.invoiceNo}.pdf`;

    // pdf
    //   .create(html, options)
    //   .toFile(`public/${pdfFileName}`, function (err, result) {
    //     if (err) {
    //       console.error(err);
    //       res.status(400).send({
    //         meta: {
    //           status: false,
    //           statusCode: 400,
    //           message: "An error occurred while generating the PDF.",
    //         },
    //       });
    //     } else {
    //       // const pdfLink = `<a href="/download-pdf/${pdfFileName}">Download Invoice Bill PDF</a>`;
    //       const pdfLink = `https://invoice-bill.onrender.com/api/download-pdf/${pdfFileName}`;
    //       res.status(200).send({
    //         meta: {
    //           status: true,
    //           statusCode: 200,
    //           message: "success",
    //         },
    //         values: pdfLink,
    //       });
    //     }
    //   });

    const html = await ejs.renderFile(templatePath, templateData);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the page content with your HTML
    await page.setContent(html);

    // Generate PDF using puppeteer
    const pdfBuffer = await page.pdf({ format: "Letter" });

    const pdfFileName = `invoice_${bill.invoiceNo}.pdf`;

    // Save the PDF file
    fs.writeFileSync(`public/${pdfFileName}`, pdfBuffer);

    const pdfLink = `https://invoice-bill.onrender.com/api/download-pdf/${pdfFileName}`;
    //  `https://invoice-bill.onrender.com/api/download-pdf/${pdfFileName}`;
    // `http://localhost:3000/api/download-pdf/${pdfFileName}`;

    // Close the browser
    await browser.close();

    res.status(200).send({
      meta: {
        status: true,
        statusCode: 200,
        message: "success",
      },
      values: pdfLink,
    });
  } catch (err) {
    res.status(500).send({
      meta: {
        status: false,
        statusCode: 500,
        message: "An error occurred while generating the PDF.",
      },
    });
  }
};

//To download the pdf
// const downloadPdf = async (req, res) => {
//   try {
//     const pdfFileName = req.params.fileName;
//     const pdfPath = path.join(__dirname, `../public/${pdfFileName}`);
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename=output.pdf`);
//     fs.createReadStream(pdfPath).pipe(res);
//   } catch (error) {
//     res.status(500).send({
//       meta: {
//         status: false,
//         statusCode: 500,
//         message: "Internal server error",
//       },
//     });
//   }
// };

// To download the pdf
const downloadPdf = async (req, res) => {
  try {
    const pdfFileName = req.params.fileName;
    const pdfPath = path.join(__dirname, `../public/${pdfFileName}`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=output.pdf`);
    fs.createReadStream(pdfPath).pipe(res);
  } catch (error) {
    res.status(500).send({
      meta: {
        status: false,
        statusCode: 500,
        message: "Internal server error",
      },
    });
  }
};

//Get bills by userId
const getBills = async (req, res) => {
  try {
    const userId = req.query.userId;
    const isValidUser = await User.findById(userId);
    if (isValidUser) {
      const checkUserBills = await Bill.find({ userId: userId });
      if (checkUserBills.length > 0) {
        res.status(200).send({
          meta: {
            status: true,
            statusCode: 200,
            message: "success",
          },
          values: checkUserBills,
        });
      } else {
        return res.status(400).send({
          meta: {
            status: false,
            statusCode: 400,
            message: "No Data available",
          },
        });
      }
    } else {
      return res.status(404).send({
        meta: {
          status: false,
          statusCode: 404,
          message: "User not found.",
        },
      });
    }
  } catch (error) {
    return res.status(500).send({
      meta: {
        status: false,
        statusCode: 500,
        message: "Internal server error",
      },
    });
  }
};

module.exports = {
  addNewInvoice,
  getInvoicePdf,
  downloadPdf,
  getBills,
};
