module.exports = require('stripe')(process.env.STRIPE_SECRET);

// Above is equivalent to:
// const stripe = require('stripe');
// const config = stripe(process.env.STRIPE_SECRET);
// module.exports = config;