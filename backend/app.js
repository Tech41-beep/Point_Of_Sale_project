const express = require('express');
const app = express();
const qs=require('qs');
const connectDb = require('./config/db');
const userRouter = require('./routes/user.route');
const categoryRouter = require('./routes/category.route');
const customerRouter = require('./routes/customers.route');
const supplierRouter = require('./routes/supplier.route');
const productRouter = require('./routes/product.route');
const uploadRouter = require('./routes/upload.route');
const authRouter = require('./routes/auth.route');
const authguard = require('./guards/auth.guard');
const cookieParser = require('cookie-parser');
const errorHandler = require('./helpers/error-handler');
const purchaseRouter = require('./routes/purchase.route');
const saleRouter = require('./routes/sale.route');
const reportRouter = require('./routes/report.route');
connectDb();

app.set('query parser', (queryString) => {
  return qs.parse(queryString, { 
    decoder: (value) => {
        const numberValue = Number(value);
        return isNaN(numberValue) ? value : numberValue;
    }
   });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', authguard, userRouter);
app.use('/api/customers', authguard, customerRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/products', productRouter);
app.use('/api/product', productRouter);
app.use('/api', uploadRouter);
app.use('/api/auth', authRouter);
app.use('/api/purchases', authguard, purchaseRouter);
app.use('/api/sales', authguard, saleRouter);
app.use(errorHandler);
app.use('/api/report', authguard, reportRouter);


module.exports = app ;
