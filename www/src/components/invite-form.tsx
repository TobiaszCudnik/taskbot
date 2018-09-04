import Button from '@material-ui/core/Button'
import React from 'react'
import { onLogin, createAccount, signInFirebase, signIn, TUser } from '../auth'

const content_form = markdown.require('../../pages/content/invite-form.md')
const content_requested = markdown.require(
  '../../pages/content/invite-requested.md'
)

type Props = {}

type State = {
  already_invited: boolean
  requested: boolean | 'processing' | 'error'
}

export default class InviteForm extends React.Component<Props, State> {
  state: State = {
    requested: false,
    already_invited: false
  }
  dispose_on_login: Function

  async componentDidMount() {
    this.dispose_on_login = onLogin(async (user: TUser) => {
      this.setState({ already_invited: true })
    }, true)
  }

  componentWillUnmount() {
    if (this.dispose_on_login) {
      this.dispose_on_login()
    }
  }

  onRequestInviteClick = async () => {
    const { requested } = this.state
    if (requested && requested !== 'error') {
      return
    }
    this.setState({
      requested: 'processing'
    })
    let user
    try {
      user = signIn()
    } catch (e) {
      this.setState({
        requested: user ? true : 'error'
      })
    }
  }

  render() {
    const { requested, already_invited } = this.state
    const show_form = requested !== true

    if (already_invited) {
      return <></>
    }

    let label: string
    switch (requested) {
      case false:
        label = 'Request an invite'
        break
      case 'error':
        label = 'Error'
        break
      case 'processing':
        label = 'Requesting...'
        break
    }

    return (
      <>
        {show_form && (
          <React.Fragment>
            <div dangerouslySetInnerHTML={{ __html: content_form }} />
            <Button
              variant="contained"
              color="primary"
              fullWidth={true}
              disabled={requested === 'processing'}
              onClick={this.onRequestInviteClick}
            >
              {label}
            </Button>
          </React.Fragment>
        )}
        {requested === true && (
          <div dangerouslySetInnerHTML={{ __html: content_requested }} />
        )}
      </>
    )
  }
}
