import React from 'react'
import Button from '@material-ui/core/Button'
import submitForm from 'submit-form'
import { onLogin } from '../../src/auth'

type Props = {
  button_props?: object
}

type State = {
  email?: string
  id_token?: string
}

export default class SignUpButton extends React.Component<Props, State> {
  state: State = {}

  disposeOnLogin: Function

  async componentDidMount() {
    this.disposeOnLogin = onLogin(user => {
      this.setState({
        id_token: user.id_token,
        email: user.email
      })
    })
  }

  componentWillUnmount() {
    if (this.disposeOnLogin) {
      this.disposeOnLogin()
    }
  }

  onSignupClick = async () => {
    if (!this.state.id_token || !this.state.email) {
      return
    }
    submitForm('/signup', {
      method: 'POST',
      body: {
        id_token: this.state.id_token
      }
    })
  }

  render() {
    return (
      <React.Fragment>
        <Button
          variant="contained"
          color="primary"
          fullWidth={true}
          onClick={this.onSignupClick}
          {...this.props.button_props}
        >
          Create Account
        </Button>
      </React.Fragment>
    )
  }
}
