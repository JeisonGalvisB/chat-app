import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import './ChatWindow.css'

const ChatWindow = ({ currentUser, targetUser }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const { socket, sendMessage, uploadFile, loadMessages, markAsRead, clearUnreadMessages } = useSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const msgs = await loadMessages(targetUser)
        setMessages(msgs)
        markAsRead(targetUser)
        clearUnreadMessages(targetUser) // Clear notifications when opening chat
      } catch (err) {
        console.error('Error loading messages:', err)
        setError('Could not load messages')
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [targetUser])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      if (message.from === targetUser) {
        setMessages(prev => [...prev, message])
        markAsRead(targetUser)
        clearUnreadMessages(targetUser) // Clear notifications when receiving message
        scrollToBottom()
      }
    }

    socket.on('message:received', handleNewMessage)

    return () => {
      socket.off('message:received', handleNewMessage)
    }
  }, [socket, targetUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')
    setError('')

    const tempMessage = {
      _id: Date.now(),
      from: currentUser,
      to: targetUser,
      content,
      timestamp: new Date(),
      temp: true
    }

    setMessages(prev => [...prev, tempMessage])

    try {
      const savedMessage = await sendMessage(targetUser, content)
      setMessages(prev =>
        prev.map(msg => msg._id === tempMessage._id ? { ...savedMessage, temp: false } : msg)
      )
    } catch (err) {
      setError(err.message || 'Error sending message')
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
      setNewMessage(content)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      handleFileSend(file)
    }
  }

  const handleFileSend = async (file) => {
    try {
      setUploading(true)
      setError('')

      // Upload file to server
      const uploadedFile = await uploadFile(file)

      // Create temporary message with preview
      const tempMessage = {
        _id: Date.now(),
        from: currentUser,
        to: targetUser,
        messageType: uploadedFile.messageType,
        fileUrl: uploadedFile.url,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
        content: uploadedFile.name,
        timestamp: new Date(),
        temp: true
      }

      setMessages(prev => [...prev, tempMessage])

      // Send message
      const savedMessage = await sendMessage(targetUser, {
        messageType: uploadedFile.messageType,
        fileUrl: uploadedFile.url,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimeType
      })

      // Replace temporary message with saved one
      setMessages(prev =>
        prev.map(msg => msg._id === tempMessage._id ? { ...savedMessage, temp: false } : msg)
      )

      setSelectedFile(null)
      fileInputRef.current.value = ''

    } catch (err) {
      console.error('Error sending file:', err)
      setError(err.message || 'Error sending file')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }

  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation')
      return
    }

    setUploading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Get approximate address using reverse geocoding API (optional)
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

          const tempMessage = {
            _id: Date.now(),
            from: currentUser,
            to: targetUser,
            messageType: 'location',
            location: { latitude, longitude, address },
            content: address,
            timestamp: new Date(),
            temp: true
          }

          setMessages(prev => [...prev, tempMessage])

          const savedMessage = await sendMessage(targetUser, {
            messageType: 'location',
            location: { latitude, longitude, address },
            content: address
          })

          setMessages(prev =>
            prev.map(msg => msg._id === tempMessage._id ? { ...savedMessage, temp: false } : msg)
          )

        } catch (err) {
          console.error('Error sending location:', err)
          setError(err.message || 'Error sending location')
        } finally {
          setUploading(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Could not get your location')
        setUploading(false)
      }
    )
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = (msg) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    switch (msg.messageType) {
      case 'image':
        return (
          <div className="message-media">
            <img src={backendUrl + msg.fileUrl} alt={msg.fileName} />
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        )
      case 'audio':
        return (
          <div className="message-media">
            <audio controls src={backendUrl + msg.fileUrl} />
            <p className="file-name">🎵 {msg.fileName}</p>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        )
      case 'file':
        return (
          <div className="message-media">
            <a href={backendUrl + msg.fileUrl} download={msg.fileName} target="_blank" rel="noopener noreferrer">
              📎 {msg.fileName}
            </a>
            <p className="file-size">{(msg.fileSize / 1024).toFixed(1)} KB</p>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        )
      case 'location':
        return (
          <div className="message-media">
            <p>📍 Shared location</p>
            <a
              href={`https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Google Maps
            </a>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        )
      default:
        return (
          <div className="message-content">
            <p>{msg.content}</p>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        )
    }
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="target-user-info">
          <div className="user-avatar-small">
            {targetUser.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4>{targetUser}</h4>
            <span className="online-indicator">🟢 Online</span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet</p>
            <small>Be the first to send a message 👋</small>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={'message' + (msg.from === currentUser ? ' sent' : ' received') + (msg.temp ? ' temp' : '')}
            >
              {renderMessage(msg)}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="message-actions">
        <button
          type="button"
          className="action-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
        >
          📎
        </button>
        <button
          type="button"
          className="action-btn"
          onClick={handleLocationShare}
          disabled={uploading}
          title="Share location"
        >
          📍
        </button>
        <button
          type="button"
          className="action-btn"
          onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/eventedit', '_blank')}
          title="Create calendar event"
        >
          📅
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />
      </div>

      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={uploading ? 'Uploading file...' : 'Message for ' + targetUser + '...'}
          maxLength={1000}
          autoFocus
          disabled={uploading}
        />
        <button type="submit" disabled={!newMessage.trim() || uploading}>
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatWindow
