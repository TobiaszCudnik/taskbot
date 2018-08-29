/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import SignupButton from './components/signup-button'
const content = markdown.require('./content/invited.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})
type Props = {}

type State = {}

class SignupPage extends React.Component<Props, State> {
  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <SignupButton />
      </div>
    )
  }
}

export default withStyles(styles)(SignupPage)
