import { useSocket } from '../context/SocketContext'
import './UserList.css'

const UserList = ({ users, selectedUser, onSelectUser }) => {
  const { unreadMessages } = useSocket()

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Online Users</h3>
        <span className="user-count">{users.length}</span>
      </div>

      <div className="users">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No other users connected</p>
          </div>
        ) : (
          users.map((user) => {
            const hasUnread = unreadMessages[user] > 0

            return (
              <div
                key={user}
                className={'user-item' + (selectedUser === user ? ' active' : '') + (hasUnread ? ' has-unread' : '')}
                onClick={() => onSelectUser(user)}
              >
                <div className="user-avatar">
                  {user.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user}</span>
                  {hasUnread ? (
                    <span className="new-message-alert">
                      🔔 NEW MESSAGE
                    </span>
                  ) : (
                    <span className="user-status">🟢 Online</span>
                  )}
                </div>
                {hasUnread && (
                  <div className="unread-badge">
                    {unreadMessages[user]}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default UserList
