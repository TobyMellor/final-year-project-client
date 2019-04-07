import * as React from 'react';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import SettingsPanel from './SettingsPanel';

configure({ adapter: new Adapter() });

describe('Settings Panel Component', () => {
  it('renders different button types', () => {
    const handleBranchNavClickFn = jest.fn();
    const wrapperSettingsPanel = mount(
      <SettingsPanel isBranchNavHidden={true}
                     onToggleBranchNavClick={() => handleBranchNavClickFn()}
                     isBranchNavDisabled={false} />);

    // Initial state of button
    expect(wrapperSettingsPanel.find('Button').prop('label')).toBe('Add Branch');
    expect(handleBranchNavClickFn).toBeCalledTimes(0);

    // Clicking the button triggers the handle fn passed through the properties
    wrapperSettingsPanel.find('Button').simulate('click');
    expect(wrapperSettingsPanel.find('Button').prop('label')).toBe('Add Branch');
    expect(handleBranchNavClickFn).toBeCalledTimes(1);

    // Passing down isBranchNavHidden triggers an update in the button
    wrapperSettingsPanel.setProps({ isBranchNavHidden: false });
    wrapperSettingsPanel.mount();
    expect(wrapperSettingsPanel.find('Button').prop('label')).toBe('Hide Branch Creator');
  });
});
