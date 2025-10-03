import { useState } from 'react'
import { useSocket } from '../context/SocketContext'
import './Login.css'

const Login = ({ onLogin }) => {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { joinChat, connected } = useSocket()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }

    if (!connected) {
      setError('No connection to server')
      return
    }

    setLoading(true)

    try {
      const response = await joinChat(nickname.trim())
      console.log('Login successful:', response)
      onLogin(response.user.nickname)
    } catch (err) {
      setError(err.message || 'Error joining chat')
      setLoading(false)
    }
  }

  const statusClass = connected ? 'connected' : 'disconnected'

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>💬 Chat App</h1>
        <p className="subtitle">Real-time chat with Socket.IO</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nickname">Nickname</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Choose your username"
              disabled={loading}
              autoFocus
              maxLength={20}
            />
            <small>3-20 characters (letters, numbers and underscores)</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !connected}
          >
            {loading ? 'Joining...' : 'Join Chat'}
          </button>

          <div className={'connection-status ' + statusClass}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
