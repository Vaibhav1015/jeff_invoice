const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Invoice Generate",
    description: "Description",
  },
  host: "https://invoice-bill.onrender.com/api",
};

const outputFile = "./swagger-output.json";

const routes = [
  "./router/userRouter.js",
  "./router/addressRouter.js",
  "./router/invoiceRouter.js",
];

swaggerAutogen(outputFile, routes, doc);
