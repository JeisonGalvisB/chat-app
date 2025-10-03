import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [unreadMessages, setUnreadMessages] = useState({}) // { nickname: count }

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      setConnected(false)
    })

    newSocket.on('users:list', (users) => {
      console.log('📋 User list updated:', users)
      setOnlineUsers(users)
    })

    newSocket.on('notification:new_message', (notification) => {
      console.log('🔔 New message notification:', notification)
      const { from } = notification
      setUnreadMessages(prev => ({
        ...prev,
        [from]: (prev[from] || 0) + 1
      }))
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const joinChat = (nickname) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not initialized'))
        return
      }

      socket.emit('user:join', { nickname }, (response) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  const sendMessage = (to, messageData) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not initialized'))
        return
      }

      // Convert simple string to object if necessary (compatibility)
      const data = typeof messageData === 'string'
        ? { to, content: messageData, messageType: 'text' }
        : { to, ...messageData }

      socket.emit('message:send', data, (response) => {
        if (response.success) {
          resolve(response.message)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  const uploadFile = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error uploading file')
      }

      return result.file
    } catch (error) {
      throw new Error(error.message || 'Error uploading file')
    }
  }

  const loadMessages = (targetUser) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not initialized'))
        return
      }

      socket.emit('messages:load', { targetUser }, (response) => {
        if (response.success) {
          resolve(response.messages)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  const markAsRead = (from) => {
    if (!socket) return
    socket.emit('messages:mark_read', { from })
    // Clear unread notifications from this user
    clearUnreadMessages(from)
  }

  const clearUnreadMessages = (nickname) => {
    setUnreadMessages(prev => {
      const newUnread = { ...prev }
      delete newUnread[nickname]
      return newUnread
    })
  }

  const value = {
    socket,
    connected,
    onlineUsers,
    unreadMessages,
    joinChat,
    sendMessage,
    uploadFile,
    loadMessages,
    markAsRead,
    clearUnreadMessages
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
