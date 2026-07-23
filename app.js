const express = require('express');
const app = express();
const connectDb = require('./config/db');
const categoryRouter = require('./routes/category.route');
const customerRouter = require('./routes/customers.route');
const supplierRouter = require('./routes/supplier.route');
const errorHandler = require('./helpers/error-handler');

connectDb();

app.use(express.json());
app.use('/api/customers', customerRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/suppliers', supplierRouter);
app.use(errorHandler);

module.exports = app ;