// Where database calls are going to be made, regardless of what DB you are using
const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  // If query is the same on Yoga and Prisma, you can forward the query from Yoga to Prisma
  // Look at schema.graphql for the query to be forwarded to Prisma
  // Equivalent to query below
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, context, info) {
    // Check if there is a current userId
    if (!context.request.userId) {
      return null;
    };

    return context.db.query.user({
      where: { id: context.request.userId }
    }, info)
  },
  async users(parent, args, context, info) {
    // Check if user is logged in
    if (!context.request.userId) {
      throw new Error('You must be logged in!');
    }

    // Check if the users has the permissions to query the users
    hasPermission(context.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

    // If they do, query all the users
    return context.db.query.users({}, info);
  },
  async order(parent, args, context, info) {
    // Check if user is logged in
    if (!context.request.userId) {
      throw new Error('You must be logged in!');
    }

    // Query the current order
    const order = await context.db.query.order({
      where: { id: args.id }
    }, info);

    // Check if they have the permissions to see the order
    const ownsOrder = order.user.id === context.request.userId;
    const hasPermissionToSeeOrder = context.request.user.permissions.includes('ADMIN');

    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("You can't see this :)");
    };

    // Return the order
    return order;
  }
  
  // Each GraphQL request comes in, you get four variables
  // async items(parent, args, context, info) {
  //   // Access to database through passing it in context in createServer.js
  //   // Returns a promise
  //   const items = await context.db.query.items();
  //   return items;
  // }
};

module.exports = Query;
