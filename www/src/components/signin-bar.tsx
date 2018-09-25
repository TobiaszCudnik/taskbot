import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles'
import Router from 'next/router'
import React, { MouseEvent } from 'react'
import { IAccount } from '../../../src/types'
import { getAccount, onLogin, signIn, signOut, TUser } from '../auth'
import Link from 'next/link'

type State = {
  user?: TUser
  account?: IAccount
  ready: boolean
}
interface Props extends WithStyles<typeof styles> {}

class SignInBar extends React.Component<Props, State> {
  mounted = false
  state: State = {
    ready: false
  }

  constructor(props: Props) {
    super(props)
    if (!process.browser) return
    // auto set cached data to avoid blinking
    const user = window.firebase.auth().currentUser
    if (user && window.taskbot_account) {
      this.state = {
        account: window.taskbot_account,
        user,
        ready: true
      }
    }
  }

  componentDidMount() {
    this.mounted = true
    onLogin(async user => {
      if (!this.mounted) return
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
    this.mounted = false
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
    // cache
    window.taskbot_account = account
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
        {(!user || !account) && this.renderNotSignedIn()}
        {user && account && this.renderSignedIn()}
      </div>
    )
  }

  renderNotSignedIn() {
    return (
      <a href="#" onClick={this.signInClick}>
        <img
          src="/static/images/google/btn_google_signin_light_normal_web.png"
          alt="Sign in with Google"
        />
      </a>
    )
  }

  renderSignedIn() {
    const { user } = this.state

    return (
      <>
        <Link href="/account">
          <a>{user.email}</a>
        </Link>
        <br />
        <a href="#" onClick={this.signOutClick}>
          Sign out
        </a>
      </>
    )
  }
}

const styles = () =>
  createStyles({
    root: {
      position: 'absolute',
      top: 30,
      right: 0,
      'text-align': 'right',
      'margin-right': '1em',
      'max-width': '30%'
    }
  })

export default withStyles(styles)(SignInBar)
