const cookieParser = require('cookie-parser');

require('dotenv').config({ path: 'variables.env' }); // Import variables.env
const createServer = require('./createServer'); // Import createServer
const db = require('./db'); // Import database

const server = createServer();

// Use express middleware to handle cookies (JWT)
// Access all the cookies in a nice formatted way instead of an unprocessed string
server.express.use(cookieParser()); // use() allows you to use any existing middleware

// TODO: Use express middleware to populate current user

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
}, details => {
  // Callback function
  // Expose environment variables
  console.log((`Server is not running on port http://localhost:${details.port}`));
});