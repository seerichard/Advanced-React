import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 5000,
  description: 'This item is really cool!',
  image: 'dog.jpg',
  largeImage: 'largeDog.jpg'
};

describe('<Item/>', () => {
  it('Renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('Renders the image properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    // Debug the actual HTML using debug()
    // console.log(wrapper.debug());

    const img = wrapper.find('img');
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  it('Renders the price tag and title properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    // Find the <a/> inside the <Title/> component
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
    
    const PriceTag = wrapper.find('PriceTag');
    expect(PriceTag.children().text()).toBe('$50');
  });

  it('Renders the buttons properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    const buttonList = wrapper.find('.buttonList');
    expect(buttonList.children()).toHaveLength(3);
    
    // All three equivalent
    expect(buttonList.find('Link')).toHaveLength(1);
    expect(buttonList.find('Link').exists()).toBe(true);
    expect(buttonList.find('Link').exists()).toBeTruthy();

    expect(buttonList.find('AddToCart').exists()).toBe(true);
    expect(buttonList.find('DeleteItem').exists()).toBe(true);
  });
});
