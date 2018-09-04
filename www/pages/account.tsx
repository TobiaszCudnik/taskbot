import { TextField, Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import { WithStyles, withStyles } from '@material-ui/core/styles'
import React, { ChangeEvent } from 'react'
import { IAccount } from '../../src/types'
import { onLogin, signIn, TUser, authorizeAccess } from '../src/auth'
import SignInBar from '../src/components/signin-bar'

const content = markdown.require('./content/account.md')

interface Props extends WithStyles<typeof styles> {}

enum CodeState {
  NOT_SEND,
  IN_PROGRESS,
  ERROR,
  SUCCESS
}

type State = {
  user?: TUser | null
  account?: IAccount | null
  code?: string
  code_state: CodeState
}

class Index extends React.Component<Props, State> {
  state: State = {
    code_state: CodeState.NOT_SEND
  }

  firebase_bound = false
  dispose_on_login: Function

  accountHandler = (data: firebase.database.DataSnapshot) => {
    const account = data.val() as IAccount
    this.setState({ account })
  }

  handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ code: event.target.value })
  }

  handleCodeSubmit = () => {
    const { code } = this.state
    this.setState({ code_state: CodeState.IN_PROGRESS })
    // TODO POST /accept_invite/:code
    alert('TODO')
  }

  handleRemoveAccount = () => {
    if (window.confirm("Are you sure? This can't be undone.")) {
      // TODO POST /remove_account
      alert('TODO')
    }
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
    const { user, account, code, code_state } = this.state

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
      code_state === CodeState.IN_PROGRESS || code_state == CodeState.SUCCESS

    let invitation_content
    if (!account.invitation_granted) {
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
          {code &&
            code.length >= 10 && (
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
    } else {
      invitation_content = (
        <>
          <h6>Enable Syncing</h6>
          <p>
            Hooray! You've been invited to TaskBot.app Private Beta! You can
            enable syncing below.
          </p>
          <p>
            After you authorize TaskBot, the service will configure itself and start syncing. Don't hesitate to express your
            feedback on the{' '}
            <a href="https://groups.google.com/forum/#!forum/taskbotapp">
              Google Group
            </a> or by dropping an email to <a href="mailto:contact@taskbot.app">contact@taskbot.app</a>.
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
