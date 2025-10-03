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
    if (window.confirm('Are you sure you want to logout?')) {
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
            Logout
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
              <p>👈 Select a user to start chatting</p>
              <small>{availableUsers.length} users online</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
