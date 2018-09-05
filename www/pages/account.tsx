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
  // TODO merge all of those into 1
  accept_state: RequestState
  remove_state: RequestState
  authorize_state: RequestState
}

class Index extends React.Component<Props, State> {
  state: State = {
    accept_state: RequestState.NOT_SENT,
    remove_state: RequestState.NOT_SENT,
    authorize_state: RequestState.NOT_SENT
  }

  firebase_bound = false
  dispose_on_login: Function

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
        code: accept_code,
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
    await signInFirebase(true)
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

  handleAuthorize = async () => {
    this.setState({ authorize_state: RequestState.IN_PROGRESS })
    authorizeAccess(this.state.user.id_token)
  }

  handleSyncEnabled = async () => {
    alert('todo')
    // set account.client_data.sync_enabled == true/false
  }

  handleRevokeAccess = async () => {
    alert('todo')
    // set account.client_data.sync_enabled == true/false
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
    const { user, account } = this.state

    if (!process.browser || !user || !account) {
      return this.contentSignIn()
    }

    let content
    if (!account || !account.invitation_granted) {
      content = this.contentInvitationPending()
    } else if (
      account &&
      account.invitation_granted &&
      !account.config.google.access_token
    ) {
      content = this.contentAuthorize()
    } else if (account && account.invitation_granted) {
      content = this.contentAccount()
    }

    return (
      <>
        <SignInBar />
        <div>
          <h3>Hi, {user.email}</h3>
          {content}
          <h6>Delete Account</h6>
          <p>
            You can remove your account and all data associated with it at any
            time.
          </p>
          <Button
            fullWidth={true}
            className={classes.remove_account}
            onClick={this.handleRemoveAccount}
          >
            Delete Account
          </Button>
        </div>
      </>
    )
  }

  private contentAccount() {
    const { classes } = this.props
    const { account } = this.state
    const sync_enabled =
      account.sync_enabled && account.client_data.sync_enabled
    const last_sync = account.last_sync || {}

    // TODO human dates
    return (
      <>
        <ul>
          <li>
            <strong>Syncing status:</strong>{' '}
            {sync_enabled ? 'Enabled' : 'Disabled'}
          </li>
          <li>
            <strong>Last GMail sync</strong> {last_sync.gmail}
          </li>
          <li>
            <strong>Last GTasks sync</strong> {last_sync.gtaks} (<a href="#">
              sync now
            </a>)<br />
            You can also <a href="#">sync directly in GMail</a> by adding a{' '}
            <span className="label command">!T/Sync GTasks</span> label.
          </li>
        </ul>
        <p>
          We hope you're enjoying <strong>TaskBot</strong>! Feedback? Discuss on
          <a href="https://groups.google.com/forum/#!forum/taskbotapp">
            Google Group
          </a>{' '}
          or drop us an email to{' '}
          <a href="mailto:contact@taskbot.app">contact@taskbot.app</a>.
        </p>
        <div className={classes.account_buttons}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleSyncEnabled}
          >
            {sync_enabled ? 'Disable' : 'Enable'} Syncing
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAuthorize}
          >
            Refresh access
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleRevokeAccess}
          >
            Revoke access
          </Button>
        </div>
      </>
    )
  }

  private contentAuthorize() {
    const { authorize_state } = this.state

    const disable_button =
      authorize_state === RequestState.IN_PROGRESS ||
      authorize_state == RequestState.SUCCESS

    return (
      <>
        <h6>Enable Syncing</h6>
        <p>
          Hooray! You've been invited to <strong>TaskBot.app</strong> Private
          Beta! You can enable syncing below.
        </p>
        <p>
          After you authorize <strong>TaskBot</strong>, the service will
          configure itself and start syncing. Don't hesitate to express your
          feedback on the{' '}
          <a href="https://groups.google.com/forum/#!forum/taskbotapp">
            Google Group
          </a>{' '}
          or by dropping an email to{' '}
          <a href="mailto:contact@taskbot.app">contact@taskbot.app</a>.
        </p>
        <Button
          variant="contained"
          color="primary"
          disabled={disable_button}
          fullWidth={true}
          onClick={this.handleAuthorize}
        >
          Enable Syncing
        </Button>
      </>
    )
  }

  private contentInvitationPending() {
    const { classes } = this.props
    const { accept_code, accept_state } = this.state

    const disable_code_form =
      accept_state === RequestState.IN_PROGRESS ||
      accept_state == RequestState.SUCCESS

    return (
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
              className={classes.submit_code}
              onClick={this.handleCodeSubmit}
              disabled={disable_code_form}
            >
              Submit
            </Button>
          )}
      </>
    )
  }

  private contentSignIn() {
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
}

const styles = (/*theme*/) => ({
  remove_account: {
    color: 'red'
  },
  submit_code: {
    'margin-left': '1em'
  },
  account_buttons: {
    display: 'flex',
    'justify-content': 'space-around'
  }
})

export default withStyles(styles)(Index)
