/* eslint-disable jsx-a11y/anchor-is-valid */

import { WithStyles, withStyles } from '@material-ui/core/styles'
import React from 'react'
import SignInBar from './components/signin-bar'

const content = markdown.require('./content/privacy-policy.md')

const styles = (/*theme*/) => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

interface Props extends WithStyles<typeof styles> {}

class Index extends React.Component<Props, {}> {

  render() {
    const { classes } = this.props

    return (
      <>
        <SignInBar />
        <div className={classes.root}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </>
    )
  }
}

export default withStyles(styles)(Index)
