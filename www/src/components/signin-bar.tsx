import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles'
import Router from 'next/router'
import React, { MouseEvent } from 'react'
import { IAccount } from '../../../src/types'
import { getAccount, onLogin, signIn, signOut, TUser } from '../auth'

type State = {
  user?: TUser
  account?: IAccount
  ready: boolean
}
interface Props extends WithStyles<typeof styles> {}

class SignInBar extends React.Component<Props, State> {
  state: State = {
    ready: false
  }

  constructor(props: Props) {
    super(props)
    if (!process.browser) return
    // auto set cached data to avoid blinking
    const user = window.firebase.auth().currentUser
    if (user && window.taskbotAccount) {
      this.state = {
        account: window.taskbotAccount,
        user,
        ready: true
      }
    }
  }

  componentDidMount() {
    onLogin(async user => {
      this.setState({
        user,
        ready: true
      })
    }, true)
    const ref1 = window.firebase.database().ref(`accounts`)
    ref1.on('child_changed', this.accountHandler)
    ref1.on('child_added', this.accountHandler)
  }

  componentWillUnmount() {
    const ref1 = window.firebase.database().ref(`accounts`)
    ref1.off('child_changed', this.accountHandler)
    ref1.off('child_added', this.accountHandler)
  }

  accountHandler = (data: firebase.database.DataSnapshot) => {
    const account = data.val() as IAccount
    const { user } = this.state
    if (
      !account ||
      !user ||
      account.email !== user.email ||
      account.uid !== user.uid
    ) {
      return
    }
    window.taskbotAccount = account
    this.setState({ account })
  }

  signInClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const fn = async () => {
      const user = await signIn()
      if (!user) return
      Router.push('/account')
    }
    fn()
  }

  signOutClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    signOut()
  }

  render() {
    const { classes } = this.props
    const { user, account, ready } = this.state

    if (!process.browser || !ready) {
      return <div className="signin-bar" />
    }

    return (
      <div className={classes.root}>
        {(!user || !account) && (
          <a href="#" onClick={this.signInClick}>
            Sign In with Google
          </a>
        )}
        {user &&
          account && (
            <>
              {user.email}
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
