const mongoose = require('mongoose');
const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Database connected successfully");
    }catch(err){
        console.log(err);
    }
}
module.exports = connectDb;