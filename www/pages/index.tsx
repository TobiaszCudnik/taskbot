import { withStyles, WithStyles } from '@material-ui/core/styles'
import React from 'react'
import { BigPlayButton, ControlBar, Player } from 'video-react'
import InviteForm from '../src/components/invite-form'
import Menu from '../src/components/menu'
import SignInBar from '../src/components/signin-bar'
import { Carousel } from 'react-responsive-carousel'

// non-module imports
require('react-responsive-carousel/lib/styles/carousel.min.css')
const content = markdown.require('./content/index.md')
const content_preface = markdown.require('./content/index-preface.md')

interface Props extends WithStyles<typeof styles_local> {}

type State = {}

class Index extends React.Component<Props, State> {
  render() {
    const { classes } = this.props

    return (
      <>
        <SignInBar />
        <Menu />
        <div className={classes.root}>
          <div dangerouslySetInnerHTML={{ __html: content_preface }} />
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop={true}
            autoPlay={true}
          >
            <div>
              <img src="/static/images/screenshots/gmail-right-sidebar.png" />
            </div>
            <div>
              <img src="/static/images/screenshots/gmail-left-sidebar.png" />
            </div>
            <div>
              <img src="/static/images/screenshots/tasks-ios.png" />
            </div>
            <div>
              <img src="/static/images/screenshots/tasks-ios-lists.png" />
            </div>
            <div>
              <img src="/static/images/screenshots/gtasks-ios.png" />
            </div>
            <div>
              <img src="/static/images/screenshots/gmail-ios.png" />
            </div>
            <div>
              <img src="/static/images/screenshots/gmail-ios-labels.png" />
            </div>
            <div>
              <img src="/static/images/screenshots/gmail-both-sidebars.png" />
            </div>
          </Carousel>
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
          <InviteForm />
        </div>
      </>
    )
  }
}

const styles_local = (/*theme*/) => ({
  root: {
    // textAlign: 'center',
    // paddingTop: theme.spacing.unit * 20
  }
})

export default withStyles(styles_local)(Index)
