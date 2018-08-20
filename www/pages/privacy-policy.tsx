/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Link from 'next/link'
const content = markdown.require('./content/privacy-policy.md')

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

/**

        <Dialog open={open} onClose={this.handleClose}>
          <DialogTitle>Super Secret Password</DialogTitle>
          <DialogContent>
            <DialogContentText>1-2-3-4-5</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleClose}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
        <Typography variant="display1" gutterBottom>
          Material-UI
        </Typography>
        <Typography variant="subheading" gutterBottom>
          example project
        </Typography>
        <Typography gutterBottom>
          <Link href="/about">
            <a>Go to the about page</a>
          </Link>
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={this.handleClick}
        >
          Super Secret Password
        </Button>
 */

Index.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Index)
