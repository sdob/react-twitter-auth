import React from 'react';
import { shallow } from 'enzyme';
import TwitterLogin from 'TwitterLogin';

describe('TwitterLogin#getRequestToken', () => {
  it('makes a POST request', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    global.open = jest.fn();
    const props = {
      loginUrl: '',
      requestTokenUrl: '',
      onFailure: jest.fn(),
      onSuccess: jest.fn(),
    };
    const wrapper = shallow(<TwitterLogin {...props} />);
    wrapper.instance().getRequestToken();
    expect(global.fetch).toHaveBeenCalled();
  });
});
