import * as httpProxy from 'http-proxy'
import config from '../../config'

// TODO config
const port = 443
if (!config.tls) {
  throw new Error('Missing TLS certificates')
}

console.log(
  `Starting an HTTPS proxy on port ${port} to localhost:${config.http_port}`
)
httpProxy
  .createProxyServer({
    target: {
      host: 'localhost',
      port: config.http_port
    },
    ssl: {
      key: config.tls.key,
      cert: config.tls.cert
    }
  })
  .listen(port)
