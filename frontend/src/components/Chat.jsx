import { useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import UserList from './UserList'
import ChatWindow from './ChatWindow'
import './Chat.css'

const Chat = ({ currentUser, onLogout }) => {
  const { onlineUsers } = useSocket()
  const [selectedUser, setSelectedUser] = useState(null)

  const availableUsers = onlineUsers.filter(user => user !== currentUser)

  const handleUserSelect = (user) => {
    setSelectedUser(user)
  }

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas salir?')) {
      onLogout()
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat App</h2>
        <div className="user-info">
          <span className="current-user">{currentUser}</span>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </div>

      <div className="chat-body">
        <UserList
          users={availableUsers}
          selectedUser={selectedUser}
          onSelectUser={handleUserSelect}
        />

        <div className="chat-main">
          {selectedUser ? (
            <ChatWindow
              currentUser={currentUser}
              targetUser={selectedUser}
            />
          ) : (
            <div className="no-chat-selected">
              <p>👈 Selecciona un usuario para comenzar a chatear</p>
              <small>{availableUsers.length} usuarios online</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
