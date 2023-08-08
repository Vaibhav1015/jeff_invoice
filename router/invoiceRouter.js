const express = require("express");
const {
  addNewInvoice,
  getInvoicePdf,
  downloadPdf,
} = require("../controller/invoiceController");
const invoiceRoute = express();

invoiceRoute.post("/add_new_invoice", addNewInvoice);
invoiceRoute.get("/generate-invoice/:billId", getInvoicePdf);
invoiceRoute.get("/download-pdf", downloadPdf);

module.exports = invoiceRoute;
