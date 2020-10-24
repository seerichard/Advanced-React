import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import RequestReset, { REQUEST_RESET_MUTATION } from '../components/RequestReset';

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: 'fake@gmail.com' }
    },
    result: {
      data: { requestReset: { message: 'success', __typename: 'Message' } }
    }
  }
];

describe('<RequestReset', () => {
  it('Renders matches snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    
    // Find the HTML <form/> tag with a data-test attribute of "form"
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  // Something is odd with the test. Sometimes it passes, sometime it fails. Maybe a delay on the test will help?
  it('Calls the mutation', async () => {
    // Pass in the mutation this time
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    // Simulate typing the email
    // Simulate a change event and pass through the result
    wrapper
      .find('input')
      .simulate('change', { target: { name: 'email', value: 'fake@gmail.com' } });

    // Submit the form
    wrapper.find('form').simulate('submit');

    // Introduce a 0 second delay. The line after await wait() will be put at the end of the call stack
    // Waiting 0 seconds will wait until the next render occurs
    await wait();

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    expect(wrapper.find('p').text()).toContain('Success! Check your email for a reset link');
  });
});
