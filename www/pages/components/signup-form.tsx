import React from 'react'
import Button from '@material-ui/core/Button'
import submitForm from 'submit-form'

type Props = {}

type State = {
  authenticated: false | 'processing' | 'error' | true
}

export default class SignupForm extends React.Component<Props, State> {
  state: State = {
    authenticated: false
  }

  onRequestInviteClick = async () => {
    if (this.state.authenticated) {
      return
    }
    this.setState({ authenticated: 'processing' })
    const instance = gapi.auth2.getAuthInstance()
    const user = await instance.signIn()
    const { id_token } = user.getAuthResponse()
    // TODO error handling?
    submitForm('/signup', {
      method: 'POST',
      body: { id_token }
    })
    this.setState({ authenticated: true })
  }

  render() {
    const authenticated = this.state.authenticated
    const show_form = authenticated !== true
    const enabled = authenticated === false || authenticated === 'error'
    const label = enabled ? 'Authenticate' : 'Authenticating'

    return (
      <React.Fragment>
        {show_form && (
          <React.Fragment>
            <Button
              variant="contained"
              color="primary"
              fullWidth={true}
              onClick={this.onRequestInviteClick}
              disabled={!enabled}
            >
              {label}
            </Button>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}
