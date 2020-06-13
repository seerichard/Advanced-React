const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    }, info) // Pass info as second argument so it knows what data to return to the client

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
    // TODO

    // Delete it
    return context.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, context, info) {
    // Lowercase the email
    args.email = args.email.toLowerCase();

    // Hash the password (one way hash)
    const password = await bcrypt.hash(args.password, 10) // 10 is the salt

    // Create the user in the database
    const user = await context.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] },
      },
    }, info);

    // Create the JWT for the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set the JWT as a cookie on the response
    context.response.cookie('token', token, {
      httpOnly: true, // Cannot be accessed by rogue JavaScript
      maxAge: 1000 * 60 * 60 * 60 * 24 * 365 // 1 year
    });

    // Return the user to the browser
    return user;
  },
  async signin(parent, { email, password }, context, info) {
    // Check if there is a user with that email
    const user = await context.db.query.user({ where: { email } });

    // No email
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    // Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);

    // Not a valid email
    if (!valid) {
      throw new Error('Invalid password!');
    }

    // Generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set the cookie with the token
    context.response.cookie('token', token, {
      httpOnly: true, // Cannot be accessed by rogue JavaScript
      maxAge: 1000 * 60 * 60 * 60 * 24 * 365 // 1 year
    });

    // Return the user
    return user;
  }

  // createDog(parent, args, context, info) {
  //   global.dogs = global.dogs || [];
  //   const newDog = { name: args.name };
  //   global.dogs.push(newDog);
  //   return newDog;
  // }
};

module.exports = Mutations;
