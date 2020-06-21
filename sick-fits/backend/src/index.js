const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' }); // Import variables.env
const createServer = require('./createServer'); // Import createServer
const db = require('./db'); // Import database

const server = createServer();

// Use express middleware to handle cookies (JWT)
// Access all the cookies in a nice formatted way instead of an unprocessed string
server.express.use(cookieParser()); // use() allows you to use any existing middleware

// Decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  
  // If the user is logged in
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);

    // Put the userId onto the req for future requests to access
    req.userId = userId;
  }

  next();
});

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