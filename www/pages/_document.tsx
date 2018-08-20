import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import flush from 'styled-jsx/server'
import Link from 'next/link'
import invite from '../src/google-auth'

class MyDocument extends Document {
  render() {
    const { pageContext } = this.props

    let invite_src = invite.toString()
    invite_src = `(${invite_src})()`

    return (
      <html lang="en" dir="ltr">
        <Head>
          <title>TaskBot.app</title>
          <meta charSet="utf-8" />
          {/* Use minimum-scale=1 to enable GPU rasterization */}
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
          />
          {/* PWA primary color */}
          <meta
            name="theme-color"
            content={pageContext.theme.palette.primary.main}
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
          />
          <link rel="stylesheet" href="/static/styles.css" />
          <script src="https://apis.google.com/js/platform.js" />
          <script dangerouslySetInnerHTML={{ __html: invite_src }} />
        </Head>
        <body>
          {/* TODO make it a component */}
          <h1 className="logo">TaskBot.app</h1>
          <h4 className="logo">GMail Task Organizer</h4>
          {/* TODO make it a component */}
          <nav className="menu">
            <ol>
              <li className="crumb selected">
                <Link href="/">
                  <a>Home</a>
                </Link>
              </li>
              <li className="crumb">
                <Link href="/gmail">
                  <a>Setup</a>
                </Link>
              </li>
              <li className="crumb">
                <Link href="/account">
                  <a>Account</a>
                </Link>
              </li>
              <li className="crumb">
                <Link href="https://github.com/TobiaszCudnik/gtd-bot">
                  <a>GitHub</a>
                </Link>
              </li>
            </ol>
          </nav>
          <Main />
          <NextScript />
          <footer>
            <small>
              <Link href="/privacy-policy">
                <a>Privacy Policy</a>
              </Link>
            </small>
            <br />
            <small>
              Copyright © 2018 <a href="https://taskbot.app">TaskBot.app</a>
            </small>
          </footer>
        </body>
      </html>
    )
  }
}

MyDocument.getInitialProps = ctx => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  let pageContext
  const page = ctx.renderPage(Component => {
    const WrappedComponent = props => {
      pageContext = props.pageContext
      return <Component {...props} />
    }

    return WrappedComponent
  })

  return {
    ...page,
    pageContext,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: (
      <React.Fragment>
        <style
          id="jss-server-side"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: pageContext.sheetsRegistry.toString()
          }}
        />
        {flush() || null}
      </React.Fragment>
    )
  }
}

export default MyDocument
