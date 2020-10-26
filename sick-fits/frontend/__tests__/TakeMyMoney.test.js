import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import NProgress from 'nprogress';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import TakeMyMoney from '../components/TakeMyMoney';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

// Mock the Next router
Router.router = { push() {} };

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
  }
];

describe('<TakeMyMoney', () => {
  it('Renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    // Introduce a 0 second delay. The line after await wait() will be put at the end of the call stack
    // Waiting 0 seconds will wait until the next render occurs
    await wait();

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    const checkoutButton = wrapper.find('ReactStripeCheckout');
    expect(toJSON(checkoutButton)).toMatchSnapshot();
  });

  it('Creates an order onToken', async () => {
    // Mock the createOrder function
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789'
        }
      }
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    // Get the <TakeMyMoney/> instance to access its functions
    const component = wrapper.find('TakeMyMoney').instance();

    // Manually call the onToken method
    component.onToken({ id: 'abc123 '}, createOrderMock);
    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({"variables": {"token": "abc123 "}});
  });

  it('Turns the progress bar on', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Mock the NProgress function
    NProgress.start = jest.fn();

    // Mock the createOrder function
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789'
        }
      }
    });

    // Get the <TakeMyMoney/> instance to access its functions
    const component = wrapper.find('TakeMyMoney').instance();

    // Manually call the onToken method
    component.onToken({ id: 'abc123 '}, createOrderMock);

    expect(NProgress.start).toHaveBeenCalled();
  });

  it('Routes to the oder page when completed', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Mock the createOrder function
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789'
        }
      }
    });

    // Get the <TakeMyMoney/> instance to access its functions
    const component = wrapper.find('TakeMyMoney').instance();

    // Mock the Next router
    Router.router.push = jest.fn();

    // Manually call the onToken method
    component.onToken({ id: 'abc123 '}, createOrderMock);

    // Make sure the router has been applied
    await wait();

    expect(Router.router.push).toHaveBeenCalled(); // Kind of unnecessary
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/order",
      query: {
        id: "xyz789"
      }
    });
  });
});
