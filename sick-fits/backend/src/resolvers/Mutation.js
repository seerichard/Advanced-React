// Where database calls are going to be made, regardless of what DB you are using
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
  }

  // createDog(parent, args, context, info) {
  //   global.dogs = global.dogs || [];
  //   const newDog = { name: args.name };
  //   global.dogs.push(newDog);
  //   return newDog;
  // }
};

module.exports = Mutations;
