import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles'
import Router from 'next/router'
import React, { MouseEvent } from 'react'
import { signInAndReqInvite, signOut } from '../../src/auth'

type State = {
  email?: string | null
  ready: boolean
}
interface Props extends WithStyles<typeof styles> {}

class SignInBar extends React.Component<Props, State> {
  state: State = {
    ready: false
  }

  componentDidMount() {
    window.firebase.auth().onAuthStateChanged(user => {
      this.setState({
        email: user && user.email,
        ready: true
      })
    })
  }

  signInClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const fn = async () => {
      try {
        const user = await signInAndReqInvite()
        if (!user) return
        this.setState({ email: user.email })
        Router.push('/account')
      } catch (e) {}
    }
    fn()
  }

  signOutClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    signOut()
  }

  render() {
    const { classes } = this.props
    const { email, ready } = this.state

    if (!process.browser || !ready) {
      return <div className="signin-bar" />
    }

    return (
      <div className={classes.root}>
        {!email && (
          <a href="#" onClick={this.signInClick}>
            Sign In
          </a>
        )}
        {email && (
          <>
            {email}
            <br />
            <a href="#" onClick={this.signOutClick}>
              Sign Out
            </a>
          </>
        )}
      </div>
    )
  }
}

const styles = () =>
  createStyles({
    root: {
      position: 'absolute',
      top: 0,
      right: 0,
      'text-align': 'right',
      'margin-right': '1em'
    }
  })

export default withStyles(styles)(SignInBar)
