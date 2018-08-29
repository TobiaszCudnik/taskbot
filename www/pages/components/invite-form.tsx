import React from 'react'
import Button from '@material-ui/core/Button'
import { signin } from '../../src/auth'

const content_form = markdown.require('../content/invite-form.md')
const content_requested = markdown.require('../content/invite-requested.md')

type Props = {}

type State = {
  // TODO enum
  requested: boolean | 'processing' | 'error'
}

export default class InviteForm extends React.Component<Props, State> {
  state: State = {
    requested: false
  }

  disposeOnLogin: Function

  onRequestInviteClick = async () => {
    const { requested } = this.state
    if (requested && requested !== 'error') {
      return
    }
    this.setState({
      requested: 'processing'
    })
    const { id_token } = await signin()
    // request the invitation
    const result = await this.requestInvitation(id_token)
    this.setState({
      requested: result ? true : 'error'
    })
  }

  async requestInvitation(id_token: string) {
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
    const { requested } = this.state
    const show_form = requested !== true
    let label: string
    switch (requested) {
      case false:
        label = 'Request an invite'
        break;
      case 'error':
        label = 'Error'
        break;
      case 'processing':
        label = 'Requesting...'
        break;
    }

    return (
      <React.Fragment>
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
      </React.Fragment>
    )
  }
}
