const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

// Where database calls are going to be made, regardless of what DB you are using
// Look at schema.graphql for the mutation to be forwarded to Prisma
const Mutations = {
  // Each GraphQL request comes in, you get four variables
  async createItem(parent, args, context, info) {
    const userId = context.request.userId;

    // Check if user is logged in
    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    // Access to database through passing it in context in createServer.js
    // Returns a promise
    const item = await context.db.mutation.createItem({
      data: {
        // This is how to create a relationship between the Item and the user
        user: {
          connect: {
            id: userId
          }
        },
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
    const item = await context.db.query.item({ where }, '{ id title user { id } }'); // Pass in raw GraphQL

    // Check if they own that item, or have the permissions
    const ownsItem = item.user.id === context.request.userId;
    const hasPermissions = context.request.user.permissions.some(permission => (
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    ));

    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }

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
  },
  signout(parent, args, context, info) {
    context.response.clearCookie('token');
    return { message: 'Goodbye!' }
  },
  async requestReset(parent, args, context, info) {
    // Check if real user
    const user = await context.db.query.user({ where: { email: args.email }});

    // No email
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }

    // Set a reset token and expiry on the user
    // Call randomBytes and specify how long it should be (20). Returns a buffer. Make it async by using promisify
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString('hex');

    // Make token valid for an hour from now
    const resetTokenExpiry = Date.now() + 3600000;

    // Update the user
    const res = await context.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    // Email the token
    // Assume that this works fine. Could add error handling and wrap in a try/catch
    await transport.sendMail({
      from: 'fake@fake.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}" >
        Click Here to Reset
      </a>
      `)
    })

    // Return the message
    return { message: 'Thanks' };
  },
  async resetPassword(parent, args, context, info) {
    // Check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error('Passwords do not match!');
    };

    // Check if its a legit password
    // Check if its expired
    // Do both at the same time to only hit db once
    // User the users query as more robust and able to use more functions on it. Returns an array
    const [user] = await context.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000 // gte = Greater than or equal to
      }
    });

    if (!user) {
      throw new Error('This token is either invalid or expired!');
    };

    // Hash the new password
    const password = await bcrypt.hash(args.password, 10);

    // Save the new password to the user and remove the old resetToken fields
    const updatedUser = await context.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    // Set the JWT cookie
    context.response.cookie('token', token, {
      httpOnly: true, // Cannot be accessed by rogue JavaScript
      maxAge: 1000 * 60 * 60 * 60 * 24 * 365 // 1 year
    });
    
    // Return the new user
    return updatedUser;
  },
  async updatePermissions(parent, args, context, info) {
    // Check if user logged in
    if (!context.request.userId) {
      throw new Error('You must be logged in!');
    };

    // Query the current user
    const currentUser = await context.db.query.user({
      where: {
        id: context.request.userId
      }
    }, info);

    // Check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    // Update the permissions, updateUser() is a function from Prisma
    return context.db.mutation.updateUser(
      {
        data: {
          permissions: {
            // Need to use set as permissions in an enum (I think)
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },
  async addToCart(parent, args, context, info) {
    // Make sure they are signed in
    const { userId } = context.request;

    if (!userId) {
      throw new Error('You must be logged in!');
    };

    // Query the users current cart
    const [ existingCartItem ] = await context.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });

    // Check if an item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('This item is already in the cart');

      return context.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      }, info)
    };

    // If it is not, create a fresh CartItem for that user
    return context.db.mutation.createCartItem({
      data: {
        user: {
          // connect is Prisma syntax
          connect: { id: userId }
        },
        item: {
          connect: { id: args.id }
        }
      }
    }, info)
  },
  async removeFromCart(parent, args, context, info) {
    // Find the cart item
    const cartItem = await context.db.query.cartItem({
      where: {
        id: args.id
      }
    }, '{ id, user { id } }'); // Pass a manual query

    // *** --> info is the query coming in <-- ***

    console.log('Inside remove FROM CART item');
    console.log(info);

    // Make sure we found an item
    if (!cartItem) throw new Error('No CartItem Found!');

    // Make sure they own that item
    if (cartItem.user.id !== context.request.userId) {
      throw new Error('Cheatin huhhh');
    };

    // Delete the cart item
    return context.db.mutation.deleteCartItem({
      where: { id: args.id }
    }, info);
  },
  async createOrder(parent, args, context, info) {
    // Query the current user and make sure they are signed in
    const { userId } = context.request;

    if (!userId) throw new Error('You must be signed in to complete this order');

    const user = await context.db.query.user({
      where: {
        id: userId
      }
    },
    `{
      id
      name
      email
      cart {
        id
        quantity
        item {
          title price id description image
        }
      }
    }`);

    // Recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + (cartItem.item.price * cartItem.quantity),
      0
    );

    console.log(`Going to charge for a total amount of ${amount}`)

    // Create the Stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token
    });

    // Convert the CartItems into OrderItems

    // Create the Order

    // Clean up - clear the user's cart, delete cartItems

    // Return the order to the client
  }

  // createDog(parent, args, context, info) {
  //   global.dogs = global.dogs || [];
  //   const newDog = { name: args.name };
  //   global.dogs.push(newDog);
  //   return newDog;
  // }
};

module.exports = Mutations;
