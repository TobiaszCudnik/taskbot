/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react'
import { withStyles } from '@material-ui/core/styles'
const content = markdown.require('./content/faq.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

class Index extends React.Component {

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    )
  }
}

export default withStyles(styles)(Index)
