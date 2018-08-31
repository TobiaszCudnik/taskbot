/* eslint-disable jsx-a11y/anchor-is-valid */

import { WithStyles, withStyles } from '@material-ui/core/styles'
import React from 'react'
import SignInBar from './components/signin-bar'
import SignupButton from './components/signup-button'

const content = markdown.require('./content/invited.md')

const styles = (/*theme*/) => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

interface Props extends WithStyles<typeof styles> {}

type State = {}

class SignupPage extends React.Component<Props, State> {
  render() {
    const { classes } = this.props

    return (
      <>
        <SignInBar />
        <div className={classes.root}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <SignupButton />
        </div>
      </>
    )
  }
}

export default withStyles(styles)(SignupPage)
