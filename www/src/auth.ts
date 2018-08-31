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
  window.firebase.initializeApp(config)
}

export async function signIn(): Promise<TUser> {
  let user = window.firebase.auth().currentUser

  if (!user) {
    const provider = new window.firebase.auth.GoogleAuthProvider()
    const result = await window.firebase.auth().signInWithPopup(provider)
    user = result.user
  }

  const id_token = await user.getIdToken()
  const email = user.email
  const uid = user.uid

  return { uid, email, id_token }
}

export async function signInAndReqInvite(): Promise<TUser> {
  const user = await signIn()
  const db = window.firebase.database()
  const data = await db.ref('invitations').once('value')
  const invitations = data.val()
  if (!invitations[user.uid]) {
    await requestInvitation(user.id_token)
  }
  return user
}

export async function signOut() {
  await window.firebase.auth().signOut()
}

export type TUser = {
  uid: string
  email: string
  id_token: string
}

export function onLogin(
  fn: (user: TUser) => void,
  every_state_change = false
): Function {
  return window.firebase.auth().onAuthStateChanged(async function(user) {
    if (!user) {
      if (every_state_change) {
        return fn(null)
      } else {
        return
      }
    }

    const id_token = await user.getIdToken()
    const email = user.email
    const uid = user.uid
    fn({ uid, email, id_token })
  })
}

export async function requestInvitation(id_token: string) {
  const res = await fetch('/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ id_token })
  })
  return res.status === 200
}
