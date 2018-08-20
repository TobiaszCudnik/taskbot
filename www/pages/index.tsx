/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

const content = markdown.require('./content/index.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

class Index extends React.Component {
  onRequestInviteClick = async () => {
    const instance = gapi.auth2.getAuthInstance()
    const user = await instance.signIn()
    const { id_token } = user.getAuthResponse()
    this.sendIDToken(id_token)
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

    return (
      <div className={classes.root}>
        <div dangerouslySetInnerHTML={{ __html: content }} />

        <form method="post" action="/invite">
          <Button
            variant="contained"
            color="primary"
            fullWidth={true}
            onClick={this.onRequestInviteClick}
          >
            Request an invite
          </Button>
        </form>
      </div>
    )
  }
}

export default withStyles(styles)(Index)
