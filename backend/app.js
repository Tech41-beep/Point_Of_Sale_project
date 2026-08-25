const express = require('express');
const app = express();
const dotenv = require('dotenv');
const qs=require('qs');
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
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const allowOrigins = [
    process.env.CLIENT_DOMAIN,
    process.env.LOCAL_DOMAIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
  }
},
credentials: true,
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin'],
exposedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin'],

}))

app.set('query parser', (queryString) => {
  return qs.parse(queryString, { 
    decoder: (value) => {
        const numberValue = Number(value);
        return isNaN(numberValue) ? value : numberValue;
    }
   });
});

if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}else{
  app.use(morgan('combined'));
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many sign-in attempts. Please try again in 5 minutes.",
  },
});

app.use(globalLimiter);
// Product images are currently submitted as Base64 data URLs. Base64 is larger
// than the original file, so this must exceed the frontend's 2 MB file limit.
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);
app.use('/api/users', authguard, userRouter);
app.use('/api/customers', authguard, customerRouter);
app.use('/api/categories', authguard, categoryRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/products', productRouter);
app.use('/api/product', productRouter);
app.use('/api', uploadRouter);
app.use('/api/purchases', authguard, purchaseRouter);
app.use('/api/sales', authguard, saleRouter);
app.use('/api/report', authguard, reportRouter);
app.use("/uploads", express.static(path.join(__dirname, "upload")));
app.use(errorHandler);


module.exports = app ;
