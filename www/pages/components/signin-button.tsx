import React from 'react'
import Button from '@material-ui/core/Button'
import { signIn } from '../../src/auth'

type Props = {
  button_props?: object
  onSignIn?: (user) => void
}

type State = {
  email?: string
  id_token?: string
}

export default class SignInButton extends React.Component<Props, State> {
  state: State = {}

  onClick = async () => {
    const user = await signIn()
    if (this.props.onSignIn) {
      this.props.onSignIn(user)
    }
  }

  render() {
    return (
      <Button
        variant="contained"
        color="primary"
        fullWidth={true}
        onClick={this.onClick}
        {...this.props.button_props}
      >
        Sign In
      </Button>
    )
  }
}
