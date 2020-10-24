import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem';
import { fakeItem } from '../lib/testUtils';

const dogImage = 'https://dog.com/dog.jpg';

// Mock the global fetch API. Must mock in the global scope. Mocking this functionality from CreateItem.js:
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }]
  })
})

// const res = await fetch('https://api.cloudinary.com/v1_1/rsee/image/upload', {
//   method: 'POST',
//   body: data
// });

// const file = await res.json();

// this.setState({
//   image: file.secure_url,
//   largeImage: file.eager[0].secure_url // Secondary transform
// })

describe('<CreateItem/>', () => {
  it('Renders and matches snapshot', async() => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it('Uploads a file when changed', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const input = wrapper.find('input[type="file"]');
    input.simulate('change', { target: { files: ['fakedog.jpg'] } });

    await wait();
    
    // Get the instance and check for the state
    const component = wrapper.find('CreateItem').instance();
    expect(component.state.image).toEqual(dogImage);
    expect(component.state.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();

    // Reset the fetch mock
    global.fetch.mockReset();
  });

  it('Handles state updating', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    // Simulate a change event and pass through the result
    wrapper.find('#title').simulate('change', { target: { value: 'Testing', name: 'title' } });
    wrapper.find('#price').simulate('change', { target: { value: '50000', name: 'price',  type: 'number' } });
    wrapper.find('#description').simulate('change', { target: { value: 'This is a really nice item', name: 'description' } });

    expect(wrapper.find('CreateItem').instance().state).toMatchObject({
      title: 'Testing',
      price: 50000,
      description: 'This is a really nice item'
    });
  });

  it('Creates an item when the form is submitted', async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            description: item.description,
            image: '',
            largeImage: '',
            price: item.price
          }
        },
        result: {
          data: {
            createItem: {
              ...fakeItem(),
              id: 'abc123',
              __typename: 'Item'
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );

    // Simulate a change event and pass through the result
    wrapper.find('#title').simulate('change', { target: { value: item.title, name: 'title' } });
    wrapper.find('#price').simulate('change', { target: { value: item.price, name: 'price',  type: 'number' } });
    wrapper.find('#description').simulate('change', { target: { value: item.description, name: 'description' } });

    // Mock the router
    Router.router = { push: jest.fn() };

    wrapper.find('form').simulate('submit');
    
    // Await a time as submit, handle upload and push - this takes some time
    await wait(50);

    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({"pathname": "/item", "query": {"id": "abc123"}});
  });
});
