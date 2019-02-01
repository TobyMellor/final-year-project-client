import * as sinon from 'sinon';
import * as React from 'React';
import { configure, shallow, mount, ReactWrapper } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { PrimaryButton, SuccessButton } from './Button';
import ui from '../../config/ui';

configure({ adapter: new Adapter() });

describe('Button Component', () => {
  it('renders different button types', () => {
    const wrapperPrimary = mount(<PrimaryButton onButtonClick={null} label="Primary Button" />);
    const wrapperSuccess = mount(<SuccessButton onButtonClick={null} label="Success Button" />);
    const primaryButton = wrapperPrimary.find('button');
    const successButton = wrapperSuccess.find('button');

    // The properties passed in should be reflected on the button
    expect(primaryButton.hasClass('btn-primary')).toBeTruthy();
    expect(primaryButton.text()).toBe('Primary Button');
    expect(successButton.hasClass('btn-success')).toBeTruthy();
    expect(successButton.text()).toBe('Success Button');
  });

  it('executes the callback when clicked', () => {
    const handleClickFn = jest.fn();
    const wrapper = mount(<PrimaryButton onButtonClick={handleClickFn} label="Test Button" />);

    wrapper.simulate('click');

    // Clicking once should execute the callback once
    expect(handleClickFn).toBeCalledTimes(1);
  });

  it('hides if required', () => {
    const wrapper = mount(<PrimaryButton onButtonClick={null} label="Test Button" />);

    // The button should be visible by default
    expect(doesButtonHaveClass(wrapper, 'd-none')).toBeFalsy();

    wrapper.setProps({ shouldHide: true });

    // The button should be invisible if requested
    expect(doesButtonHaveClass(wrapper, 'd-none')).toBeTruthy();
  });

  it('fades in if required', () => {
    const clock = sinon.useFakeTimers();
    const wrapper = mount(<PrimaryButton onButtonClick={null} label="Test Button" />);

    // The button should not fade in/out by default
    expect(doesButtonHaveClass(wrapper, 'start-fade')).toBeFalsy();
    expect(doesButtonHaveClass(wrapper, 'end-fade')).toBeFalsy();

    wrapper.setProps({ shouldFadeIn: true });

    // The button should start to fade out initially
    expect(doesButtonHaveClass(wrapper, 'start-fade')).toBeTruthy();
    expect(doesButtonHaveClass(wrapper, 'end-fade')).toBeFalsy();

    // Fast forward to the end of the animation
    clock.tick(ui.button.fadeAnimationDurationMs);
    wrapper.update();
    clock.restore();

    // The button should end the fade out after the animation
    expect(doesButtonHaveClass(wrapper, 'start-fade')).toBeFalsy();
    expect(doesButtonHaveClass(wrapper, 'end-fade')).toBeTruthy();
  });

  /**
   * Util for finding the button element and
   * checking if it has a class
   *
   * @param wrapper The container wrapper
   * @param className The class to check on the button el
   *
   * @returns if button has class
   */
  function doesButtonHaveClass(wrapper: ReactWrapper, className: string) {
    return wrapper.find('button').hasClass(className);
  }
});
