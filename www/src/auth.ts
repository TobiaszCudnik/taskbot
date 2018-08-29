export async function initFirebase(config) {
  // TODO tmp
  config = {
    apiKey: 'AIzaSyA59EKt5xXeV4SF324SuD-cA_pOXXTIjKE',
    authDomain: 'gtd-bot.firebaseapp.com',
    // databaseURL: 'https://gtd-bot.firebaseio.com',
    databaseURL: 'https://gtd-bot-test.firebaseio.com',
    projectId: 'gtd-bot',
    storageBucket: 'gtd-bot.appspot.com',
    messagingSenderId: '900809192866'
  }
  firebase.initializeApp(config)
}

export async function signin(): Promise<{
  uid: string
  email: string
  id_token: string
}> {
  let user = firebase.auth().currentUser

  if (!user) {
    const provider = new firebase.auth.GoogleAuthProvider()
    const result = await firebase.auth().signInWithPopup(provider)
    user = result.user
  }

  const id_token = await user.getIdToken()
  const email = user.email
  const uid = user.uid

  return { uid, email, id_token }
}

export function onLogin(fn): Function {
  return firebase.auth().onAuthStateChanged(async function(user) {
    const id_token = await user.getIdToken()
    const email = user.email
    const uid = user.uid
    fn({ uid, email, id_token })
  })
}
