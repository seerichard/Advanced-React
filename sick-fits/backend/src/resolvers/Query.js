// Where database calls are going to be made, regardless of what DB you are using
const Query = {
  // Each GraphQL request comes in, you get four variables
  dogs(parent, args, context, info) {
    // return [{ name: 'Snickers' }, { name: 'Sonny' }];
    global.dogs = global.dogs || [];
    return global.dogs;
  }
};

module.exports = Query;
