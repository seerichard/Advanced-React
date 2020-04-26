// Where database calls are going to be made, regardless of what DB you are using
 // Look at schema.graphql for the mutation to be forwarded to Prisma
const Mutations = {
  // Each GraphQL request comes in, you get four variables
  async createItem(parent, args, context, info) {
    // TODO: Check if user is logged in

    // Access to database through passing it in context in createServer.js
    // Returns a promise
    const item = await context.db.mutation.createItem({
      data: {
        ...args
      }
    }, info)

    return item;
  },
  updateItem(parent, args, context, info) {
    // First take a copy of the updates
    const updates = { ...args };

    // Remove the ID from the updates
    delete updates.id;

    // Run the update method
    return context.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info); // Return info (an Item)
  },
  async deleteItem(parent, args, context, info) {
    const where = { id: args.id };

    // Find the item
    const item = await context.db.query.item({ where }, '{ id, title }'); // Pass in raw GraphQL

    // Check if they own that item, or have the permissions

    // Delete it
    return context.db.mutation.deleteItem({ where }, info);
  }

  // createDog(parent, args, context, info) {
  //   global.dogs = global.dogs || [];
  //   const newDog = { name: args.name };
  //   global.dogs.push(newDog);
  //   return newDog;
  // }
};

module.exports = Mutations;
