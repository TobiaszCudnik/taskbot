import { TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import { WithStyles, withStyles } from '@material-ui/core/styles'
import React, { ChangeEvent } from 'react'
import { IAccount } from '../../src/types'
import {
  authorizeAccess,
  onLogin,
  signIn,
  signInFirebase,
  TUser
} from '../src/auth'
import SignInBar from '../src/components/signin-bar'
import { RequestState } from '../src/utils'

const content = markdown.require('./content/account.md')

interface Props extends WithStyles<typeof styles> {}

type State = {
  user?: TUser | null
  account?: IAccount | null
  accept_code?: string
  accept_state: RequestState
  remove_state: RequestState
}

class Index extends React.Component<Props, State> {
  state: State = {
    accept_state: RequestState.NOT_SENT,
    remove_state: RequestState.NOT_SENT
  }

  firebase_bound = false
  dispose_on_login: Function

  accountHandler = (data: firebase.database.DataSnapshot) => {
    const account = data.val() as IAccount
    const { user } = this.state
    if (!account || !user || account.email !== this.state.user.email) {
      return
    }
    this.setState({ account })
  }

  handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ accept_code: event.target.value })
  }

  handleCodeSubmit = async () => {
    const { accept_code, user } = this.state
    this.setState({ accept_state: RequestState.IN_PROGRESS })

    const res = await fetch('/accept_invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        accept_code,
        id_token: user.id_token
      })
    })
    this.setState({
      accept_state:
        res.status === 200 ? RequestState.SUCCESS : RequestState.ERROR
    })
  }

  handleRemoveAccount = async () => {
    if (!window.confirm("Are you sure? This can't be undone.")) {
      return
    }
    const { user } = this.state
    await signInFirebase()
    const res = await fetch('/remove_account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        id_token: user.id_token
      })
    })
    if (!res.ok) return
    await window.firebase.auth().currentUser.delete()
    alert('You account has been deleted')
  }

  async listenFirebase() {
    this.firebase_bound = true
    const ref1 = window.firebase.database().ref(`accounts`)
    ref1.on('child_changed', this.accountHandler)
    ref1.on('child_added', this.accountHandler)
  }

  handleSignIn = async () => {
    const user = await signIn()
    this.setState({ user })
  }

  handleSignUp = async () => {
    authorizeAccess(this.state.user.id_token)
  }

  async componentDidMount() {
    this.dispose_on_login = onLogin(async (user: TUser) => {
      this.setState({ user })
      this.listenFirebase()
    }, true)
  }

  componentWillUnmount() {
    if (this.dispose_on_login) {
      this.dispose_on_login()
    }
    // dispose firebase handlers
    if (this.firebase_bound) {
      const ref2 = window.firebase.database().ref(`accounts`)
      ref2.off('child_added', this.accountHandler)
      ref2.off('child_changed', this.accountHandler)
    }
  }

  render() {
    const { classes } = this.props
    const { user, account, accept_code, accept_state } = this.state

    if (!process.browser || !user || !account) {
      return (
        <>
          <SignInBar />
          <div>
            <h4>Sign In</h4>
            <p>
              Please use the button below to sign in using your Google Account:
            </p>
            <Button
              variant="contained"
              color="primary"
              fullWidth={true}
              onClick={this.handleSignIn}
            >
              Sign In with Google
            </Button>
          </div>
        </>
      )
    }

    const disable_code_form =
      accept_state === RequestState.IN_PROGRESS ||
      accept_state == RequestState.SUCCESS

    let invitation_content
    if (!account || !account.invitation_granted) {
      invitation_content = (
        <>
          <h6>Invitation pending</h6>
          <p>
            We're sorry, but your invitation to Private Beta is still pending
            acceptance. We'll let you know once we have a free spot :)
          </p>
          <TextField
            label="Invitation code"
            helperText="Do you have an invitation code?"
            style={{ width: '15em' }}
            name="code"
            onChange={this.handleCodeChange}
            disabled={disable_code_form}
          />
          {accept_code &&
            accept_code.length >= 10 && (
              <Button
                className={classes.submitCode}
                onClick={this.handleCodeSubmit}
                disabled={disable_code_form}
              >
                Submit
              </Button>
            )}
        </>
      )
    } else if (account && account.invitation_granted) {
      invitation_content = (
        <>
          <h6>Enable Syncing</h6>
          <p>
            Hooray! You've been invited to TaskBot.app Private Beta! You can
            enable syncing below.
          </p>
          <p>
            After you authorize TaskBot, the service will configure itself and
            start syncing. Don't hesitate to express your feedback on the{' '}
            <a href="https://groups.google.com/forum/#!forum/taskbotapp">
              Google Group
            </a>{' '}
            or by dropping an email to{' '}
            <a href="mailto:contact@taskbot.app">contact@taskbot.app</a>.
          </p>
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            onClick={this.handleSignUp}
            disabled={disable_code_form}
          >
            Enable Syncing
          </Button>
        </>
      )
    }

    return (
      <>
        <SignInBar />
        <div>
          <h3>Hi, {user.email}</h3>
          {invitation_content}
          <h6>Delete Account</h6>
          <p>
            You can remove your account and all data associated with it at any
            time.
          </p>
          <Button
            fullWidth={true}
            className={classes.removeAccount}
            onClick={this.handleRemoveAccount}
          >
            Delete Account
          </Button>
        </div>
      </>
    )
  }
}

const styles = (/*theme*/) => ({
  removeAccount: {
    color: 'red'
  },
  submitCode: {
    'margin-left': '1em'
  }
})

export default withStyles(styles)(Index)
