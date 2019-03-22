import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'whatwg-fetch';
import 'url-search-params-polyfill';
import TwitterIcon from 'react-icons/lib/fa/twitter';

class TwitterLogin extends Component {
  constructor(props) {
    super(props);

    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick(e) {
    e.preventDefault();
    return this.getRequestToken();
  }

  getHeaders() {
    const { customHeaders } = this.props;
    return {
      ...customHeaders,
      'Content-Type': 'application/json',
    };
  }

  getRequestToken() {
    const {
      credentials,
      forceLogin,
      requestTokenUrl,
    } = this.props;
    const popup = this.openPopup();

    return window
      .fetch(requestTokenUrl, {
        credentials,
        method: 'POST',
        headers: this.getHeaders(),
      })
      .then(response => response.json())
      .then((data) => {
        /* eslint-disable camelcase */
        const { screenName } = this.props;
        const { oauth_token } = data;
        let authenticationUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}&force_login=${forceLogin}`;

        if (screenName) {
          authenticationUrl = `${authenticationUrl}&screen_name=${screenName}`;
        }

        popup.location = authenticationUrl;
        this.polling(popup);
        /* eslint-enable camelcase */
      })
      .catch((error) => {
        const { onFailure } = this.props;
        popup.close();
        return onFailure(error);
      });
  }

  getOauthToken(oAuthVerifier, oauthToken) {
    const {
      credentials,
      loginUrl,
      onFailure,
      onSuccess,
    } = this.props;
    return window
      .fetch(
        `${loginUrl}?oauth_verifier=${oAuthVerifier}&oauth_token=${oauthToken}`,
        {
          credentials,
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            oauth_verifier: oAuthVerifier,
            oauth_token: oauthToken,
          }),
        },
      )
      .then((response) => {
        onSuccess(response);
      })
      .catch(error => onFailure(error));
  }

  getDefaultButtonContent() {
    const { showIcon, text } = this.props;
    const defaultIcon = showIcon ? (
      <TwitterIcon color="#00aced" size={25} />
    ) : null;

    return (
      <span>
        {defaultIcon}
        {' '}
        {text}
      </span>
    );
  }

  openPopup() {
    const { dialogWidth, dialogHeight } = this.props;
    const w = dialogWidth;
    const h = dialogHeight;
    const left = screen.width / 2 - w / 2;
    const top = screen.height / 2 - h / 2;

    const windowFeatures = [
      'toolbar=no',
      'location=no',
      'directories=no',
      'menubar=no',
      'scrollbars=no',
      'resizable=no',
      'copyhistory=no',
      `width=${w}`,
      `height=${h}`,
      `top=${top}`,
      `left=${left}`,
    ].join(', ');

    return window.open(
      '',
      '',
      windowFeatures,
    );
  }

  polling(popup) {
    const { onFailure } = this.props;
    const polling = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(polling);
        onFailure(new Error('Popup has been closed by user'));
      }

      const closeDialog = () => {
        clearInterval(polling);
        popup.close();
      };

      try {
        if (
          !popup.location.hostname.includes('api.twitter.com')
          && popup.location.hostname !== ''
        ) {
          if (popup.location.search) {
            const query = new URLSearchParams(popup.location.search);

            const oauthToken = query.get('oauth_token');
            const oauthVerifier = query.get('oauth_verifier');

            closeDialog();
            return this.getOauthToken(oauthVerifier, oauthToken);
          }
          closeDialog();
          return onFailure(
            new Error(
              'OAuth redirect has occurred but no query or hash parameters were found. '
              + 'They were either not set during the redirect, or were removed—typically by a '
              + 'routing library—before Twitter react component could read it.'
            )
          );
        }
      } catch (error) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        // A hack to get around same-origin security policy errors in IE.
      }
    }, 500);
  }


  render() {
    const {
      children,
      className,
      disabled,
      style,
      tag,
    } = this.props;
    const twitterButton = React.createElement(
      tag,
      {
        style,
        disabled,
        className,
        onClick: this.onButtonClick,
      },
      children ? children : this.getDefaultButtonContent(),
    );
    return twitterButton;
  }
}

TwitterLogin.propTypes = {
  children: PropTypes.node,
  tag: PropTypes.string,
  text: PropTypes.string,
  loginUrl: PropTypes.string.isRequired,
  requestTokenUrl: PropTypes.string.isRequired,
  onFailure: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  dialogWidth: PropTypes.number,
  dialogHeight: PropTypes.number,
  showIcon: PropTypes.bool,
  credentials: PropTypes.oneOf(['omit', 'same-origin', 'include']),
  customHeaders: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  forceLogin: PropTypes.bool,
  screenName: PropTypes.string
};

TwitterLogin.defaultProps = {
  children: null,
  tag: 'button',
  text: 'Sign in with Twitter',
  disabled: false,
  dialogWidth: 600,
  dialogHeight: 400,
  showIcon: true,
  credentials: 'same-origin',
  customHeaders: {},
  forceLogin: false,
  screenName: ''
};

export default TwitterLogin;
