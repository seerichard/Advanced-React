import { mount } from 'enzyme';
import wait from 'waait';
import PleaseSignIn from '../components/PleaseSignIn';
import { CURRENT_USER_QUERY } from '../components/User';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser } from '../lib/testUtils';

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } }
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
];

describe('<PleaseSignIn/>', () => {
  it('Renders the sign in dialog to logged out users', async () => {
    // Wrap the component in MockedProvider to simulate the <ApolloProvider/>
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignIn />
      </MockedProvider>
    );

    // Introduce a 0 second delay. The line after await wait() will be put at the end of the call stack
    // Waiting 0 seconds will wait until the next render occurs
    await wait();

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    expect(wrapper.text()).toContain('Please Sign In before continuing');

    // Find the <Signin/> component
    expect(wrapper.find('Signin').exists()).toBe(true);
  });

  it('Renders the child component when the user is signed in', async () => {
    const Hey = () => <p>Hey!</p>;

    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignIn>
          <Hey />
        </PleaseSignIn>
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Find the <Hey/> component. Pass in component vs a selector above with <Signin/>
    expect(wrapper.contains(<Hey/>)).toBe(true);
  });
})
