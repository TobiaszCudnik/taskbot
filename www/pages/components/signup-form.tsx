import React from 'react'
import Button from '@material-ui/core/Button'
import submitForm from 'submit-form'

const content = markdown.require('../content/signup-form.md')

type Props = {}

type State = {
  authenticated: false | 'processing' | 'error' | true
  authenticate_clicked?: boolean
  email?: string
  id_token?: string
}

export default class SignupForm extends React.Component<Props, State> {
  state: State = {
    authenticated: 'processing'
  }

  // TODO extract to GoogleAuthProvider
  // inject the source script dynamically
  async componentDidMount() {
    gapi.load('client', () => {
      const auth = gapi.auth2.getAuthInstance()
      auth.currentUser.listen(user => {
        if (user.isSignedIn()) {
          this.setState({ authenticated: true })
          this.setState({
            authenticated: true,
            email: user.getBasicProfile().getEmail(),
            id_token: user.getAuthResponse().id_token
          })
        } else {
          this.setState({ authenticated: false })
        }
      })
    })
  }

  onRequestInviteClick = async () => {
    if (this.state.authenticated && this.state.authenticated !== 'error') {
      return
    }
    this.setState({
      authenticate_clicked: true,
      authenticated: 'processing'
    })
    const auth = gapi.auth2.getAuthInstance()
    let signin
    try {
      signin = await auth.signIn()
    } catch (e) {
      this.setState({ authenticated: 'error' })
    }
    const { id_token } = signin.getAuthResponse()
    this.setState({
      id_token,
      authenticated: true
    })
    this.signUp()
  }

  signUp = () => {
    // TODO error handling?
    submitForm('/signup', {
      method: 'POST',
      body: {
        id_token: this.state.id_token
      }
    })
  }

  render() {
    const { authenticated, authenticate_clicked } = this.state

    const auth_show_form = authenticated !== true
    const auth_enabled = authenticated === false || authenticated === 'error'
    const auth_label = auth_enabled ? 'Authenticate' : 'Authenticating'

    const signup_show_form = !authenticate_clicked && authenticated === true

    return (
      <React.Fragment>
        {auth_show_form && (
          <React.Fragment>
            {auth_enabled && (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth={true}
              onClick={this.onRequestInviteClick}
              disabled={!auth_enabled}
            >
              {auth_label}
            </Button>
          </React.Fragment>
        )}
        {signup_show_form && (
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            onClick={this.signUp}
          >
            Create Account
          </Button>
        )}
      </React.Fragment>
    )
  }
}
