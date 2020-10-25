import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import Cart, { LOCAL_STATE_QUERY } from '../components/Cart';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

// FYI - Currently no good way to test local client state mutations

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()]
        }
      }
    }
  },
  {
    request: { query: LOCAL_STATE_QUERY },
    result: { data: { cartOpen: true } }
  }
];

describe('<Cart/>', () => {
  it('Renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Cart />
      </MockedProvider>
    );

    // Introduce a 0 second delay. The line after await wait() will be put at the end of the call stack
    // Waiting 0 seconds will wait until the next render occurs
    await wait();

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    expect(toJSON(wrapper.find('header'))).toMatchSnapshot();
    expect(wrapper.find('CartItem')).toHaveLength(1);
  });
});
