import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CartCount from '../components/CartCount';

describe('<CartCount/>', () => {
  it('Renders', () => {
    // Do not need to add an expect as if it cannot render, the shallow will fail
    shallow(<CartCount count={10} />);
  });

  it('Matches the snapshot', () => {
    const wrapper = shallow(<CartCount count={10} />);

    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('Updates via props', () => {
    const wrapper = shallow(<CartCount count={50} />);
    expect(toJSON(wrapper)).toMatchSnapshot();

    wrapper.setProps({ count: 10 });
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
