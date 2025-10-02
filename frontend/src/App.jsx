import { useState } from 'react'
import { SocketProvider } from './context/SocketContext'
import Login from './components/Login'
import Chat from './components/Chat'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogin = (nickname) => {
    setCurrentUser(nickname)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  return (
    <SocketProvider>
      <div className="app">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Chat currentUser={currentUser} onLogout={handleLogout} />
        )}
      </div>
    </SocketProvider>
  )
}

export default App
