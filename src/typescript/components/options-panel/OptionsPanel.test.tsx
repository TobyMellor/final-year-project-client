import * as React from 'react';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import OptionsPanel from './OptionsPanel';

configure({ adapter: new Adapter() });

describe('Settings Panel Component', () => {
  it.skip('renders different button types', () => {
    // const handleBranchNavClickFn = jest.fn();
    // const wrapperOptionsPanel = mount(
    //   <OptionsPanel isBranchNavHidden={true}
    //                  onToggleBranchNavClick={() => handleBranchNavClickFn()}
    //                  isBranchNavDisabled={false} />);

    // // Initial state of button
    // expect(wrapperOptionsPanel.find('Button').prop('label')).toBe('Add Branch');
    // expect(handleBranchNavClickFn).toBeCalledTimes(0);

    // // Clicking the button triggers the handle fn passed through the properties
    // wrapperOptionsPanel.find('Button').simulate('click');
    // expect(wrapperOptionsPanel.find('Button').prop('label')).toBe('Add Branch');
    // expect(handleBranchNavClickFn).toBeCalledTimes(1);

    // // Passing down isBranchNavHidden triggers an update in the button
    // wrapperOptionsPanel.setProps({ isBranchNavHidden: false });
    // wrapperOptionsPanel.mount();
    // expect(wrapperOptionsPanel.find('Button').prop('label')).toBe('Hide Branch Creator');
  });
});
