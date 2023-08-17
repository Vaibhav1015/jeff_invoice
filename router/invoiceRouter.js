const express = require("express");
const {
  addNewInvoice,
  getInvoicePdf,
  downloadPdf,
} = require("../controller/invoiceController");
const { checkLogin } = require("../middleware/checkLogin");
const invoiceRoute = express();

invoiceRoute.post("/add_new_invoice", checkLogin, addNewInvoice);
invoiceRoute.get("/generate-invoice/:billId", checkLogin, getInvoicePdf);
invoiceRoute.get("/download-pdf/:fileName", downloadPdf);

module.exports = invoiceRoute;
