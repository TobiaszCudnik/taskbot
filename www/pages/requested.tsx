/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Link from 'next/link'
const content = markdown.require('./content/requested.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

class Index extends React.Component {
  state = {
    open: false
  }

  handleClose = () => {
    this.setState({
      open: false
    })
  }

  handleClick = () => {
    this.setState({
      open: true
    })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    )
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Index)
