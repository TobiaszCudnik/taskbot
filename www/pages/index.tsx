import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import SignupForm from './components/invite-form'
import { Player, BigPlayButton, ControlBar } from 'video-react'

const content = markdown.require('./content/index.md')

const styles = theme => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

class Index extends React.Component<{}, {}> {
  state = {
    signup: false
  }

  render() {
    const { classes } = this.props

    // TODO extract the signup form to a separate component
    return (
      <div className={classes.root}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <h6>GMail with the official Tasks client (iOS)</h6>
        <div style={{ width: '100%' }}>
          <Player
            playsInline
            src="/static/videos/gmail-web-tasks-ios.m4v"
            poster="/static/images/vid1.png"
          >
            <BigPlayButton position="center" />
            <ControlBar autoHide={true} />
          </Player>
        </div>
        <h6>GMail with the official Tasks client (Android)</h6>
        <div style={{ width: '100%', paddingRight: '40px' }}>
          <Player
            playsInline
            src="/static/videos/gmail-web-tasks-android.mp4"
            poster="/static/videos/gmail-web-tasks-android.png"
          >
            <BigPlayButton position="center" />
            <ControlBar autoHide={true} />
          </Player>
        </div>
        <h6>GMail with the GTasks client (iOS)</h6>
        <div style={{ width: '100%' }}>
          <Player
            playsInline
            src="/static/videos/gmail-web-gtasks-ios.mp4"
            poster="/static/videos/gmail-web-gtasks-ios.png"
          >
            <BigPlayButton position="center" />
            <ControlBar autoHide={true} />
          </Player>
        </div>
        <h6>GMail with the Tasks sidebar</h6>
        <div style={{ width: '100%' }}>
          <Player
            playsInline
            src="/static/videos/gmail-web-tasks-sidebar.mp4"
            poster="/static/videos/gmail-web-tasks-sidebar.png"
          >
            <BigPlayButton position="center" />
            <ControlBar autoHide={true} />
          </Player>
        </div>
        <h6>GMail (iOS) with the Tasks Canvas webapp</h6>
        <div style={{ width: '100%' }}>
          <Player
            playsInline
            src="/static/videos/gmail-ios-tasks-canvas.mp4"
            poster="/static/videos/gmail-ios-tasks-canvas.png"
          >
            <BigPlayButton position="center" />
            <ControlBar autoHide={true} />
          </Player>
        </div>
        <h6>GMail using the keyboard only</h6>
        <div style={{ width: '100%' }}>
          <Player
            playsInline
            src="/static/videos/gmailkeys-web-tasks-sidebar.mp4"
            poster="/static/videos/gmailkeys-web-tasks-sidebar.png"
          >
            <BigPlayButton position="center" />
            <ControlBar autoHide={true} />
          </Player>
        </div>
        <SignupForm />
      </div>
    )

    // <video src="/static/videos/test-vid1-ver2.m4v" style={{width: '100%'}} controls={true}></video>
  }
}

export default withStyles(styles)(Index)
