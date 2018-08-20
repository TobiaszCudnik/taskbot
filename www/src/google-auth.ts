export default function() {
  function start() {
    // 2. Initialize the JavaScript client library.
    gapi.auth2
      .init({
        clientId: '900809192866-rvmuos3to6bcidcvnpeqv0alqcnskhvj.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/userinfo.email'
      })
  }
  // 1. Load the JavaScript client library.
  gapi.load('client', start)
}
