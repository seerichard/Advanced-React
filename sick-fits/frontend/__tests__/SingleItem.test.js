import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import SingleItem, { SINGLE_ITEM_QUERY } from '../components/SingleItem';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeItem } from '../lib/testUtils';

describe('<SingleItem/>', () => {
  it('Renders with proper data', async () => {
    const mocks = [
      {
        // When someone makes a request with this query and variable combo
        request: { query: SINGLE_ITEM_QUERY, variables: { id: '123' } },
        // Return this fake data (mocked data)
        result: {
          data: {
            item: fakeItem()
          }
        }
      }
    ];

    // Wrap the component in MockedProvider to simulate the <ApolloProvider/>
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );

    expect(wrapper.text()).toContain('Loading...');

    // Introduce a 0 second delay. The line after await wait() will be put at the end of the call stack
    // Waiting 0 seconds will wait until the next render occurs
    await wait();

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    // Snapshot only the section you are looking for
    // If the entire wrapper was snapshot, the entire <ApolloProvider/> would be captured
    expect(toJSON(wrapper.find('h2'))).toMatchSnapshot();
    expect(toJSON(wrapper.find('img'))).toMatchSnapshot();
    expect(toJSON(wrapper.find('p'))).toMatchSnapshot();
  });

  it('Errors with a not found item', async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: {id: '123'} },
        result: {
          errors: [{ message: 'Items Not Found!'}]
        }
      }
    ];

    // Wrap the component in MockedProvider to simulate the <ApolloProvider/>
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
  
    // Introduce a 0 second delay. The line after await wait() will be put at the end of the call stack
    // Waiting 0 seconds will wait until the next render occurs
    await wait();

    // Update the component (sync enzyme component tree snapshot with the react component tree)
    wrapper.update();

    // Add data tags to easily find parts of a component
    const item = wrapper.find('[data-test="graphql-error"]');
    expect(item.text()).toContain('Items Not Found!');
    expect(toJSON(item)).toMatchSnapshot();

  })
});
