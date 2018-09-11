import dynamic from 'next/dynamic'
import { withStyles, WithStyles } from '@material-ui/core/styles'
import React from 'react'
import { BigPlayButton, ControlBar, Player } from 'video-react'
import InviteForm from '../src/components/invite-form'
import Menu from '../src/components/menu'
import SignInBar from '../src/components/signin-bar'
import { Carousel } from 'react-responsive-carousel'

// non-module imports
const Lightbox = dynamic(import('react-image-lightbox'))
require('react-responsive-carousel/lib/styles/carousel.min.css')
require('react-image-lightbox/style.css')
const content = markdown.require('./content/index.md')
const content_preface = markdown.require('./content/index-preface.md')

interface Props extends WithStyles<typeof styles_local> {}

type State = {
  screenshot_index: number
  modal_open: boolean
}

const base_url = '/static/images/screenshots/'
const screenshots = [
  'gmail-right-sidebar.png',
  'gmail-left-sidebar.png',
  'tasks-ios.png',
  'tasks-ios-lists.png',
  'gtasks-ios.png',
  'gmail-ios.png',
  'gmail-ios-labels.png',
  'gmail-both-sidebars.png'
]

class Index extends React.Component<Props, State> {
  state = {
    screenshot_index: 0,
    modal_open: false
  }

  openModalImage = (e: React.MouseEvent<HTMLElement>, index: number) => {
    e.preventDefault()
    this.setState({
      modal_open: true,
      screenshot_index: index
    })
  }

  closeModalImage = () => {
    this.setState({
      modal_open: false
    })
  }

  nextModalImage = () => {
    const index = this.state.screenshot_index
    this.setState({
      screenshot_index: (index + 1) % screenshots.length
    })
  }

  prevModalImage = () => {
    const index = this.state.screenshot_index
    this.setState({
      screenshot_index: (index + screenshots.length - 1) % screenshots.length
    })
  }

  renderModalImage() {
    const index = this.state.screenshot_index

    return (
      process.browser &&
      this.state.modal_open && (
        <Lightbox
          mainSrc={base_url + screenshots[index]}
          nextSrc={base_url + screenshots[(index + 1) % screenshots.length]}
          prevSrc={
            base_url +
            screenshots[(index + screenshots.length - 1) % screenshots.length]
          }
          onCloseRequest={this.closeModalImage}
          onMovePrevRequest={this.prevModalImage}
          onMoveNextRequest={this.nextModalImage}
        />
      )
    )
  }

  render() {
    const { classes } = this.props

    return (
      <>
        {this.renderModalImage()}
        <SignInBar />
        <Menu />
        <div className={classes.root}>
          <div dangerouslySetInnerHTML={{ __html: content_preface }} />
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop={true}
            autoPlay={false}
            verticalSwipe="natural"
          >
            {screenshots.map((name, index) => (
              <div key={name} onClick={e => this.openModalImage(e, index)}>
                <img key={name} src={base_url + name} />
              </div>
            ))}
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
