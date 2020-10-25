import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { ApolloConsumer } from 'react-apollo';
import { MockedProvider } from 'react-apollo/test-utils';
import Signup, { SIGNUP_MUTATION } from '../components/Signup';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser } from '../lib/testUtils';

const type = (wrapper, name, value) => (
  wrapper.find(`input[name="${name}"]`).simulate('change', {
    target: { name, value }
  })
);

const me = fakeUser();
const mocks = [
  // Signup mock mutation
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        email: me.email,
        name: me.name,
        password: 'rich'
      }
    },
    result: {
      data: {
        signup: {
          __typename: 'User',
          id: 'abc123',
          email: me.email,
          name: me.name
        }
      }
    }
  },
  // Current user query mock
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me } }
  }
];

describe('<Signup/>', () => {
  it('Renders and matchs snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <Signup />
      </MockedProvider>
    );

    expect(toJSON(wrapper.find('form'))).toMatchSnapshot();
  });

  it('Calls the mutation properly', async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client; // Set the apolloClient to the exposed client from ApolloConsumer
            return <Signup />
          }}
        </ApolloConsumer>
      </MockedProvider>
    );

    // Introduce a 0 second delay. The line after await wait() will be put at the end of the call stack
    // Waiting 0 seconds will wait until the next render occurs
    await wait();

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    // Simulate form changes
    type(wrapper, 'name', me.name);
    type(wrapper, 'email', me.email);
    type(wrapper, 'password', 'rich');

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    wrapper.find('form').simulate('submit');

    await wait(); // Not entirely necessary but can end up with a race condition. This fixes it

    // Query the user out of the Apollo Client
    const user = await apolloClient.query({ query: CURRENT_USER_QUERY });

    // Check if the user has been saved in the Apollo store
    expect(user.data.me).toMatchObject(me);
  });
});
