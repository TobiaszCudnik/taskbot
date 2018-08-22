import React from 'react'
import Button from '@material-ui/core/Button'

const content_form = markdown.require('../content/invite-form.md')
const content_requested = markdown.require('../content/invite-requested.md')

type Props = {}

type State = {
  // TODO add error, enum
  invite: false | 'processing' | true
}

export default class InviteForm extends React.Component<Props, State> {
  state: State = {
    invite: false
  }

  onRequestInviteClick = async () => {
    if (this.state.invite) {
      return
    }
    this.setState({ invite: 'processing' })
    const instance = gapi.auth2.getAuthInstance()
    const user = await instance.signIn()
    const { id_token } = user.getAuthResponse()
    // TODO check if successful
    await this.sendIDToken(id_token)
    this.setState({ invite: true })
  }

  async sendIDToken(id_token: string) {
    const res = await fetch('/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ id_token })
    })
    return res.status === 200
  }

  render() {
    const invite_requested = this.state.invite
    const show_form =
      invite_requested === false || invite_requested === 'processing'

    return (
      <React.Fragment>
        {show_form && (
          <React.Fragment>
            <div dangerouslySetInnerHTML={{ __html: content_form }} />
            <Button
              variant="contained"
              color="primary"
              fullWidth={true}
              onClick={this.onRequestInviteClick}
            >
              {invite_requested ? 'Requesting...' : 'Request an invite'}
            </Button>
          </React.Fragment>
        )}
        {invite_requested === true && (
          <div dangerouslySetInnerHTML={{ __html: content_requested }} />
        )}
      </React.Fragment>
    )
  }
}
