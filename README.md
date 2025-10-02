# 💬 Real-Time Chat Application

A modern, full-stack real-time chat application built with React, Node.js, Socket.IO, and MongoDB. Features private messaging, online status tracking, and message persistence.

![Chat App](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-19.2-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)

## 🌟 Features

### Real-Time Communication
- ⚡ **Instant messaging** with Socket.IO WebSockets
- 💬 **Private 1-to-1 conversations**
- 🟢 **Online/offline status** tracking in real-time
- 📨 **Message delivery confirmation**

### User Experience
- 🔐 **Simple authentication** with unique nicknames
- 👥 **Live user list** with instant updates
- 📜 **Message history** with MongoDB persistence
- ✅ **Read/unread status** system
- 📱 **Responsive design** for all devices

### Technical Highlights
- 🚀 **Fast development** with Vite HMR
- 🐳 **Docker support** for easy deployment
- 🔒 **Input validation** and error handling
- 🎨 **Modern UI/UX** with gradients and animations
- 📊 **RESTful API** endpoints

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  (React + Vite + Socket.IO Client)                         │
│                    Port: 5173                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ WebSocket + HTTP
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                         Backend                             │
│  (Node.js + Express + Socket.IO Server)                    │
│                    Port: 3001                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Mongoose
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                        MongoDB                              │
│             (Database - Messages & Users)                   │
│                    Port: 27017                              │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** v18 or higher - [Download](https://nodejs.org/)
- **npm** v8 or higher (comes with Node.js)
- **MongoDB** v6.0 or higher - [Download](https://www.mongodb.com/try/download/community)
- **Docker** (optional, recommended) - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-app
```

### 2. Start MongoDB (Docker Method - Recommended)

```bash
docker-compose up -d mongo
```

Verify MongoDB is running:
```bash
docker ps | grep mongo
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed
npm start
```

Expected output:
```
🚀 Servidor corriendo en http://localhost:3001
📦 MongoDB conectado: localhost
🔌 Socket.IO listo para conexiones
```

### 4. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:5173/
```

### 5. Open Application

Navigate to `http://localhost:5173` in your browser.

**Test with multiple users:**
- Open multiple browser tabs/windows
- Login with different nicknames
- Start chatting!

## 📁 Project Structure

```
chat-app/
├── backend/                    # Node.js backend server
│   ├── src/
│   │   ├── config/            # Database & constants
│   │   ├── middleware/        # Error handling
│   │   ├── models/            # MongoDB schemas
│   │   ├── services/          # Business logic
│   │   ├── socket/            # Socket.IO handlers
│   │   └── server.js          # Main entry point
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── README.md              # Backend documentation
│
├── frontend/                   # React frontend app
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # Context providers
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── README.md              # Frontend documentation
│
├── docker-compose.yml         # Docker orchestration
├── test-socket.js             # Socket.IO test script
└── README.md                  # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 19.2** - UI library
- **Vite** - Build tool with HMR
- **Socket.IO Client** - Real-time communication
- **CSS3** - Modern styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **Mongoose** - MongoDB ODM
- **dotenv** - Environment configuration

### Database
- **MongoDB 6.0** - NoSQL database
- Collections: `users`, `messages`

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📡 API Documentation

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `http://localhost:3001/` | API info |
| GET | `http://localhost:3001/health` | Health check |
| GET | `http://localhost:3001/api/debug/users` | Connected users (dev) |

### Socket.IO Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `{ nickname: string }` | Join chat |
| `message:send` | `{ to: string, content: string }` | Send message |
| `messages:load` | `{ targetUser: string }` | Load history |
| `messages:mark_read` | `{ from: string }` | Mark as read |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `users:list` | `string[]` | Online users |
| `message:received` | `Message` | New message |
| `notification:new_message` | `Notification` | New msg alert |

## 🧪 Testing

### Test Backend Health

```bash
curl http://localhost:3001/health
```

### Test Socket.IO Connection

```bash
node test-socket.js
```

Expected output:
```
✅ Conectado al servidor Socket.IO
✅ Usuario unido exitosamente
✅ Sistema de join con nickname único
✅ Validaciones de nickname
✅ Lista de usuarios online
```

### Manual Testing

1. Open `http://localhost:5173` in two browser windows
2. Login as "Alice" in window 1
3. Login as "Bob" in window 2
4. Select each other from users list
5. Send messages back and forth
6. Verify real-time updates

## 🐳 Docker Deployment

### Start All Services

```bash
docker-compose up -d
```

This starts:
- MongoDB (port 27017)
- Backend (port 3001)
- Mongo Express UI (port 8081)

### View Logs

```bash
docker-compose logs -f
```

### Stop All Services

```bash
docker-compose down
```

### Clean Up (Remove Volumes)

```bash
docker-compose down -v
```

## 🌐 Production Deployment

### Backend Deployment Options

1. **Heroku** - Easy deployment with MongoDB addon
2. **Railway** - Modern platform with auto-deploy
3. **DigitalOcean App Platform** - Managed containers
4. **AWS EC2** - Full control with PM2
5. **Render** - Free tier available

See [backend/README.md](backend/README.md) for detailed deployment instructions.

### Frontend Deployment Options

1. **Vercel** - Recommended, zero-config
2. **Netlify** - Easy drag-and-drop
3. **GitHub Pages** - Free static hosting
4. **Render** - Full-stack platform
5. **AWS S3 + CloudFront** - Scalable CDN

See [frontend/README.md](frontend/README.md) for detailed deployment instructions.

### Environment Configuration

**Backend (.env):**
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chat-app
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend (.env):**
```env
VITE_BACKEND_URL=https://your-backend-url.com
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon (auto-reload)
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server with HMR
```

### Database Management

**Using Mongo Express (Docker):**
```
URL: http://localhost:8081
Username: admin
Password: admin123
```

**Using MongoDB Compass:**
```
Connection: mongodb://localhost:27017/chat-app
```

## 🔒 Security Features

- ✅ Input validation on all user inputs
- ✅ Nickname uniqueness enforcement
- ✅ Content length limits (1000 characters)
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ XSS protection via React escaping
- ⚠️ Note: This is a demo app - nickname-based auth only

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  nickname: String (unique, 3-20 chars, alphanumeric + _),
  socketId: String,
  isOnline: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection

```javascript
{
  _id: ObjectId,
  from: String (nickname),
  to: String (nickname),
  content: String (1-1000 chars),
  timestamp: Date,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Roadmap & Future Features

- [ ] Group chat rooms
- [ ] File/image sharing
- [ ] Emoji picker & reactions
- [ ] Typing indicators
- [ ] Voice/video calls
- [ ] User profiles with avatars
- [ ] Dark mode
- [ ] Message encryption (E2E)
- [ ] Push notifications
- [ ] Message search
- [ ] Message editing/deletion
- [ ] User blocking
- [ ] Moderation tools

## 🐛 Troubleshooting

### Backend won't start

**Issue:** MongoDB connection error

**Solution:**
```bash
# Verify MongoDB is running
docker ps | grep mongo

# Or restart MongoDB
docker-compose restart mongo
```

### Frontend can't connect

**Issue:** Socket.IO connection failed

**Solution:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Verify `.env` has correct backend URL
3. Check browser console for CORS errors

### Port conflicts

**Issue:** Port already in use

**Solution:**
```bash
# Find process
lsof -i :3001  # or :5173

# Kill process
kill -9 <PID>
```

## 📝 Scripts Reference

### Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
npm run docker:up  # Start MongoDB with Docker
npm run docker:down # Stop Docker containers
```

### Frontend Scripts

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update README if adding features
- Test thoroughly before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Socket.IO team for amazing real-time framework
- MongoDB team for robust database
- React team for excellent UI library
- Vite team for lightning-fast tooling
- Express.js community
- Open source community

## 📞 Support

For issues, questions, or suggestions:

- 🐛 [Open an issue](https://github.com/yourusername/chat-app/issues)
- 💬 [Start a discussion](https://github.com/yourusername/chat-app/discussions)
- 📧 Email: your.email@example.com

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ using Node.js, React, and Socket.IO**