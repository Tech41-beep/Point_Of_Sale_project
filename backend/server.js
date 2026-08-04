const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDb = require('./config/db');
connectDb();

const port = process.env.PORT || 8000;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
