// Where database calls are going to be made, regardless of what DB you are using
const { forwardTo } = require('prisma-binding');

const Query = {
  // If query is the same on Yoga and Prisma, you can forward the query from Yoga to Prisma
  // Look at schema.graphql for the query to be forwarded to Prisma
  // Equivalent to query below
  items: forwardTo('db'),
  item: forwardTo('db')
  
  // Each GraphQL request comes in, you get four variables
  // async items(parent, args, context, info) {
  //   // Access to database through passing it in context in createServer.js
  //   // Returns a promise
  //   const items = await context.db.query.items();
  //   return items;
  // }
};

module.exports = Query;
