import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { onLogin } from '../src/auth'

const content = markdown.require('./content/account.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

class Index extends React.Component {
  state = {
    open: false,
    logged_in: false
  }

  disposeOnLogin: Function

  async componentDidMount() {
    this.disposeOnLogin = onLogin(user => {
      this.setState({ logged_in: Boolean(user) })
    })
  }

  componentWillUnmount() {
    if (this.disposeOnLogin) {
      this.disposeOnLogin()
    }
  }

  render() {
    const { classes } = this.props
    const { logged_in } = this.state

    if (!process.browser) {
      return (
        <div className={classes.root}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )
    }

    const user = firebase.auth().currentUser

    return (
      <div className={classes.root}>
        {logged_in && (
          <React.Fragment>Logged in as: {user.email}</React.Fragment>
        )}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    )
  }
}

export default withStyles(styles)(Index)
