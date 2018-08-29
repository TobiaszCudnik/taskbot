import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { TInvitation } from '../../src/server/google-auth'
import { IAccount } from '../../src/types'
import { onLogin, TUser } from '../src/auth'
import SignInButton from './components/signin-button'
import InvitationForm from './components/invite-form'

const content = markdown.require('./content/account.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

type State = {
  user?: TUser | null
  account?: IAccount | null
  invitation?: TInvitation | null
}

class Index extends React.Component<{}, State> {
  state: State = {}

  disposeOnLogin: Function

  async componentDidMount() {
    this.disposeOnLogin = onLogin(async (user: TUser) => {
      this.setState({ user })
      this.loadAccount(user.uid)
      this.loadInvitation(user.uid)
    })
  }

  async loadAccount(uid: string) {
    const account = await firebase
      .database()
      .ref(`accounts/${uid}`)
      .once('value')
    this.setState({ account })
  }

  async loadInvitation(uid: string) {
    const invitation = await firebase
      .database()
      .ref(`invitations/${uid}`)
      .once('value')
    this.setState({ invitation })
  }

  componentWillUnmount() {
    if (this.disposeOnLogin) {
      this.disposeOnLogin()
    }
  }

  render() {
    const { classes } = this.props
    const { user, account, invitation } = this.state

    if (!process.browser || !user) {
      return (
        <div className={classes.root}>
          <h4>Sign In</h4>
          <p>
            Please use the button below to sign in using your Google Account:
          </p>
          <SignInButton />
        </div>
      )
    }

    return (
      <div className={classes.root}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <p>Logged in as: {user.email}</p>
        <pre>Account: {JSON.stringify(account, null, 1)}</pre>
        <pre>Invitation: {JSON.stringify(invitation, null, 1)}</pre>
        {invitation !== undefined && !invitation && <InvitationForm />}
      </div>
    )
  }
}

export default withStyles(styles)(Index)
