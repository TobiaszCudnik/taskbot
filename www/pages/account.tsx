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
  stats: TStatsUser
  accept_code?: string
  action_state: RequestState
}

export type TStatsUser = {
  uid?: string
  last_client_read?: string
  last_sync_gmail?: string
  last_sync_gtasks?: string
}

class Index extends React.Component<Props, State> {
  state: State = {
    action_state: RequestState.NOT_SENT,
    stats: {}
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

  statsHandler = (data: firebase.database.DataSnapshot) => {
    const stats = (data.val() as TStatsUser) || {}
    const { user } = this.state
    if (stats.uid !== user.uid) {
      return
    }
    this.setState({ stats })
  }

  handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ accept_code: event.target.value })
  }

  handleCodeSubmit = async () => {
    const { accept_code, user } = this.state
    this.setState({ action_state: RequestState.IN_PROGRESS })

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
      action_state:
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
    const ref2 = window.firebase.database().ref(`stats/users`)
    ref1.on('child_changed', this.accountHandler)
    ref1.on('child_added', this.accountHandler)
    ref2.on('child_changed', this.statsHandler)
    ref2.on('child_added', this.statsHandler)
  }

  handleSignIn = async () => {
    const user = await signIn()
    this.setState({ user })
  }

  handleAuthorize = async () => {
    this.setState({ action_state: RequestState.IN_PROGRESS })
    authorizeAccess(this.state.user.id_token)
    this.setState({ action_state: RequestState.SUCCESS })
  }

  handleSyncEnabled = async sync_enabled => {
    const { user } = this.state
    this.setState({ action_state: RequestState.IN_PROGRESS })
    try {
      await window.firebase
        .database()
        .ref(`accounts/${user.uid}/client_data`)
        .update({
          sync_enabled
        })
    } catch (e) {
      this.setState({ action_state: RequestState.ERROR })
    }
    this.setState({ action_state: RequestState.SUCCESS })
  }

  handleSyncGTasks = async () => {
    const { user } = this.state
    this.setState({ action_state: RequestState.IN_PROGRESS })
    try {
      await window.firebase
        .database()
        .ref(`accounts/${user.uid}/client_data`)
        .update({
          sync_gtasks: true
        })
    } catch (e) {
      this.setState({ action_state: RequestState.ERROR })
    }
    this.setState({ action_state: RequestState.SUCCESS })
  }

  handleRevokeAccess = async () => {
    const { user } = this.state
    const res = await fetch('/revoke_access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        id_token: user.id_token
      })
    })
    const action_state =
      res.status === 200 ? RequestState.SUCCESS : RequestState.ERROR
    this.setState({ action_state })
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
      const ref1 = window.firebase.database().ref(`accounts`)
      ref1.off('child_added', this.accountHandler)
      ref1.off('child_changed', this.accountHandler)
      const ref2 = window.firebase.database().ref(`stats/users`)
      ref2.off('child_added', this.statsHandler)
      ref2.off('child_changed', this.statsHandler)
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
    const { account, stats } = this.state
    const sync_enabled =
      account.sync_enabled && account.client_data.sync_enabled

    return (
      <>
        <ul>
          <li>
            <strong>Syncing status:</strong>{' '}
            {sync_enabled ? 'Enabled' : 'Disabled'}
          </li>
          <li>
            <strong>Last GMail sync:</strong> {stats.last_sync_gmail || '???'}
          </li>
          <li>
            <strong>Last GTasks sync:</strong> {stats.last_sync_gtasks || '???'}{' '}
            (<a href="#" onClick={this.handleSyncGTasks}>sync now</a>)<br />
            You can also <a href="/faq/#">sync directly in GMail</a> by adding
            the <span className="label command">!T/Sync GTasks</span> label to{' '}
            <strong>any email</strong>.
          </li>
          <li>
            <strong>Ongoing tasks:</strong> {stats.ongoing_tasks || '???'}
          </li>
          <li>
            <strong>Completed tasks:</strong> {stats.completed_tasks || '???'}
          </li>
          <li>
            <strong>Tasks in total:</strong> {stats.total_tasks || '???'}
          </li>
        </ul>
        <p>
          We hope you're enjoying <strong>TaskBot</strong>! Feedback? Discuss it on{' '}
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
            onClick={() => this.handleSyncEnabled(!sync_enabled)}
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
    const { action_state } = this.state

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
          disabled={action_state === RequestState.IN_PROGRESS}
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
    const { accept_code, action_state } = this.state

    const disable_code_form = action_state === RequestState.IN_PROGRESS

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
