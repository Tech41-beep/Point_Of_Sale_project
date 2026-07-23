const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');
const connectDb = require('./config/db');
connectDb();

const port = process.env.PORT || 8000;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
