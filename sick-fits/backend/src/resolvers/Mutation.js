// Where database calls are going to be made, regardless of what DB you are using
const Mutations = {
  // Each GraphQL request comes in, you get four variables
  createDog(parent, args, context, info) {
    global.dogs = global.dogs || [];
    const newDog = { name: args.name };
    global.dogs.push(newDog);
    return newDog;
  }
};

module.exports = Mutations;
