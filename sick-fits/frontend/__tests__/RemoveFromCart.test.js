import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { ApolloConsumer } from 'react-apollo';
import { MockedProvider } from 'react-apollo/test-utils';
import RemoveFromCart, { REMOVE_FROM_CART_MUTATION } from '../components/RemoveFromCart';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem({ id: 'abc123' })]
        }
      }
    }
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: 'abc123' } },
    result: {
      data: {
        removeFromCart: {
          __typename: 'CartItem',
          id: 'abc123'
        }
      }
    }
  }
  // No need to have a second query: CURRENT_USER_QUERY as we use an update
  // function to remove the item from the cache
];

describe('<RemoveFromCart/>', () => {
  it('Renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RemoveFromCart id="abc123" />
      </MockedProvider>
    );

    expect(toJSON(wrapper.find('button'))).toMatchSnapshot();
  });

  it('Removes the item from cart', async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client; // Set the apolloClient to the exposed client from ApolloConsumer
            return <RemoveFromCart id="abc123" />
          }}
        </ApolloConsumer>
      </MockedProvider>
    );

    const res = await apolloClient.query({ query: CURRENT_USER_QUERY });

    // The initial cart should have one item in it
    expect(res.data.me.cart).toHaveLength(1);
    expect(res.data.me.cart[0].item.price).toBe(5000);

    wrapper.find('button').simulate('click');

    await wait();

    const res2 = await apolloClient.query({ query: CURRENT_USER_QUERY });

    // Cart should now be empty
    expect(res2.data.me.cart).toHaveLength(0);
  });
});
