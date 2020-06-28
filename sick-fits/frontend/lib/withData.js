import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';
import { LOCAL_STATE_QUERY } from '../components/Cart';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    // Local state data
    clientState: {
      resolvers: {
        Mutation: {
          // Underscore used if param not used - General practice to do this
          // Destructured { cache } was from client - client: { cache }
          toggleCart(_, variables, { cache }) {
            // Read the cartOpen value from the cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY
            });

            // Write the cart state to the opposite
            const data = {
              data: { cartOpen: !cartOpen }
            };

            // Write to the cache
            cache.writeData(data);

            return data;
          }
        }
      },
      defaults: {
        cartOpen: false
      }
    }
  });
}

export default withApollo(createClient);
