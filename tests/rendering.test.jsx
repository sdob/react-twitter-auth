import React from 'react';
import ReactDOM from 'react-dom';
import TwitterLogin from 'TwitterLogin';

describe('TwitterLogin', () => {
  const props = {
    loginUrl: '',
    requestTokenUrl: '',
    onFailure: jest.fn(),
    onSuccess: jest.fn(),
  };
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<TwitterLogin {...props} />, div);
  });
});
