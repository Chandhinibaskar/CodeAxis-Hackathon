import { useState } from 'react'
import { currentUser, logout } from './auth.js'
import AuthPage from './components/AuthPage.jsx'
import Background from './components/Background.jsx'
import Workspace from './Workspace.jsx'

// Shows login/signup until a user is signed in, then the review workspace, over one animated background.
export default function App() {
  const [user, setUser] = useState(currentUser())
  return (<>
    <Background />
    {user ? <Workspace user={user} onLogout={() => { logout(); setUser(null) }} /> : <AuthPage onAuth={setUser} />}
  </>)
}
