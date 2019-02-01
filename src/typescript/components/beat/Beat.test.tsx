// import * as sinon from 'sinon';
// import * as React from 'React';
// import { configure, shallow, mount, ReactWrapper } from 'enzyme';
// import * as Adapter from 'enzyme-adapter-react-16';
// import { PrimaryButton, SuccessButton } from './Button';
// import ui from '../../config/ui';

// configure({ adapter: new Adapter() });

// describe('Button Component', () => {
//   it('renders different button types', () => {
//     const wrapperPrimary = mount(<PrimaryButton onButtonClick={null} label="Primary Button" />);
//     const wrapperSuccess = mount(<SuccessButton onButtonClick={null} label="Success Button" />);
//     const primaryButton = wrapperPrimary.find('button');
//     const successButton = wrapperSuccess.find('button');

//     expect(primaryButton.hasClass('btn-primary')).toBeTruthy();
//     expect(primaryButton.text()).toBe('Primary Button');
//     expect(successButton.hasClass('btn-success')).toBeTruthy();
//     expect(successButton.text()).toBe('Success Button');
//   });

//   it('executes the callback when clicked', () => {
//     const handleClickFn = jest.fn();
//     const wrapper = mount(<PrimaryButton onButtonClick={handleClickFn} label="Test Button" />);

//     wrapper.simulate('click');

//     expect(handleClickFn).toBeCalledTimes(1);
//   });
// });