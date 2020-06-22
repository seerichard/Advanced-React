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

// Create a middleware that populates the user on each request
server.express.use(async (req, res, next) => {
  // If the user is not logged in, skip
  if (!req.userId) return next();

  // Query takes in two arguments, they query and what you want returned
  const user = await db.query.user(
    { where: { id: req.userId } },
    '{ id, permissions, email, name }'
  );

  // Put the user onto the req for future requests to access
  req.user = user;

  next();
});

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