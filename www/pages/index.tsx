import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

const content = markdown.require('./content/index.md')
const content_form = markdown.require('./content/invite-form.md')
const content_requested = markdown.require('./content/invite-requested.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

type State = {
  invite_requested: false | 'processing' | true
}

class Index extends React.Component<{}, State> {
  state = {
    invite_requested: false
  }
  onRequestInviteClick = async () => {
    if (this.state.invite_requested) {
      return
    }
    const instance = gapi.auth2.getAuthInstance()
    const user = await instance.signIn()
    const { id_token } = user.getAuthResponse()
    this.setState({ invite_requested: 'processing' })
    await this.sendIDToken(id_token)
    this.setState({ invite_requested: true })
  }

  async sendIDToken(id_token: string) {
    await fetch('/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ id_token })
    })
  }

  render() {
    const { classes } = this.props

    const invite_requested = this.state.invite_requested
    const show_form =
      invite_requested === false || invite_requested === 'processing'

    return (
      <div className={classes.root}>
        <div dangerouslySetInnerHTML={{ __html: content }} />

        {show_form && (
          <React.Fragment>
            <div dangerouslySetInnerHTML={{ __html: content_form }} />
            <form method="post" action="/invite">
              <Button
                variant="contained"
                color="primary"
                fullWidth={true}
                onClick={this.onRequestInviteClick}
              >
                {invite_requested ? 'Requesting...' : 'Request an invite'}
              </Button>
            </form>
          </React.Fragment>
        )}
        {invite_requested === true && (
          <div dangerouslySetInnerHTML={{ __html: content_requested }} />
        )}
      </div>
    )
  }
}

export default withStyles(styles)(Index)
