import Link from 'next/link'
import React from 'react'
import { withRouter } from 'next/router'

type Props = {
  router?: {
    pathname: string
    query: string
    asPath: string
  }
}

// TODO render along with SignInBar as a PageHeader component
class Menu extends React.Component<Props, {}> {
  isSelected(path: string, exact_match = false) {
    const current = this.props.router.pathname
    if (exact_match) {
      return current == path
    } else {
      return current.startsWith(path)
    }
  }

  render() {
    return (
      <nav className="menu">
        <ol>
          <li className={this.isSelected('/', true) ? 'selected' : ''}>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          <li className={this.isSelected('/faq') ? 'selected' : ''}>
            <Link href="/faq">
              <a>FAQ</a>
            </Link>
          </li>
          <li>
            <Link href="https://groups.google.com/forum/#!forum/taskbotapp">
              <a>Discuss</a>
            </Link>
          </li>
          <li className={this.isSelected('/account') ? 'selected' : ''}>
            <Link href="/account">
              <a>Account</a>
            </Link>
          </li>
          <li>
            <Link href="https://github.com/TaskSync/TaskBot.app">
              <a>GitHub</a>
            </Link>
          </li>
        </ol>
      </nav>
    )
  }
}

export default withRouter(Menu)
