const mongoose = require('mongoose');
const connectDb = async()=>{
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is missing from backend/.env');
    }

    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database connected successfully");
}
module.exports = connectDb;
