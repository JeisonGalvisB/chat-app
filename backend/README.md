# Chat App - Backend

Real-time chat application backend built with Node.js, Express, Socket.IO, and MongoDB.

## 🚀 Features

- **Real-time messaging** using Socket.IO
- **Private 1-to-1 conversations**
- **Message persistence** with MongoDB
- **User authentication** with unique nicknames
- **Online/offline status tracking**
- **Message read/unread system**
- **Message history loading**
- **Input validation** and error handling
- **RESTful API** endpoints
- **Docker support** for MongoDB

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) 
- **npm** (comes with Node.js)
- **MongoDB** (v6.0 or higher) 
  - **Option 1:** Install MongoDB locally
  - **Option 2:** Use Docker (recommended)
- **Docker** (optional, for containerized MongoDB)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-app/backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `socket.io` - Real-time communication
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/chat-app

# For Docker MongoDB:
# MONGODB_URI=mongodb://mongo:27017/chat-app

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

## 🗄️ Database Setup

### Option A: Using Docker (Recommended)

Start MongoDB container:

```bash
cd ..
docker-compose up -d mongo
```

Verify MongoDB is running:

```bash
docker ps | grep mongo
```

### Option B: Local MongoDB Installation

1. Install MongoDB from [official website](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Windows:**
```bash
net start MongoDB
```

3. Verify MongoDB is running:
```bash
mongosh --eval "db.version()"
```

## ▶️ Running the Application

### Development Mode

Start the server with auto-reload (using nodemon):

```bash
npm run dev
```

### Production Mode

Start the server:

```bash
npm start
```

Expected output:

```
==================================================
🚀 Servidor corriendo en http://localhost:3001
🌍 Ambiente: development
🔌 Socket.IO listo para conexiones
==================================================
📦 MongoDB conectado: localhost
📊 Base de datos: chat-app
🔌 Socket.IO inicializado correctamente
```

## 📡 API Endpoints

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check endpoint |
| GET | `/api/debug/users` | Connected users (dev only) |

### Socket.IO Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `{ nickname }` | Join chat with nickname |
| `message:send` | `{ to, content }` | Send private message |
| `messages:load` | `{ targetUser }` | Load message history |
| `messages:mark_read` | `{ from }` | Mark messages as read |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `users:list` | `[nicknames]` | Updated online users list |
| `message:received` | `{ from, content, timestamp }` | New message received |
| `notification:new_message` | `{ from, preview }` | New message notification |

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T16:35:12.280Z",
  "uptime": 18.836382161,
  "environment": "development"
}
```

### Test Socket.IO Connection

Run the included test script:

```bash
cd ..
node test-socket.js
```

## 🐳 Docker Deployment

### Build Backend Image

```bash
docker build -t chat-app-backend .
```

### Run with Docker Compose

Start all services (MongoDB + Backend):

```bash
cd ..
docker-compose up -d
```

Stop services:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f backend
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── constants.js      # App constants
│   ├── middleware/
│   │   └── errorHandler.js   # Error handling middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Message.js        # Message schema
│   ├── services/
│   │   ├── userService.js    # User business logic
│   │   └── messageService.js # Message business logic
│   ├── socket/
│   │   └── socketHandler.js  # Socket.IO event handlers
│   └── server.js             # Main server file
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json              # Dependencies
├── Dockerfile                # Docker configuration
└── README.md                 # This file
```

## 🔒 Security Considerations

- Input validation on all user inputs
- Nickname uniqueness enforcement
- Content length limits (1000 chars)
- CORS configuration
- Environment variable protection
- No password storage (nickname-based auth only)

## 🌐 Deployment

### Environment-Specific Configuration

**Development:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chat-app
```

**Production:**
```env
NODE_ENV=production
MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/chat-app
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms


#### **Option 1: Railway**

1. Connect GitHub repository to Railway
2. Add MongoDB service
3. Configure environment variables
4. Deploy automatically on push

#### **Option 2: DigitalOcean App Platform**

1. Create new app from GitHub
2. Configure build/run commands
3. Add managed MongoDB database
4. Set environment variables
5. Deploy

#### **Option 3: AWS EC2**

1. Launch EC2 instance
2. Install Node.js and MongoDB
3. Clone repository
4. Configure environment
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start src/server.js --name chat-backend
pm2 save
pm2 startup
```

#### **Option 4: Render**

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables
5. Deploy automatically

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
- Verify MongoDB is running: `docker ps` or `systemctl status mongod`
- Check connection string in `.env`
- Ensure port 27017 is not blocked

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Socket.IO Connection Failed

**Error:** Client cannot connect to Socket.IO

**Solution:**
- Verify CORS configuration in `server.js`
- Check firewall settings
- Ensure `FRONTEND_URL` matches client URL

## 📊 Monitoring

### View Connected Users (Development)

```bash
curl http://localhost:3001/api/debug/users
```

### Database Inspection

Using MongoDB Compass:
```
mongodb://localhost:27017/chat-app
```

Using Mongo Express (Docker):
```
http://localhost:8081
Username: admin
Password: admin123
```

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3001` | No |
| `MONGODB_URI` | MongoDB connection string | - | **Yes** |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | No |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Socket.IO team for real-time capabilities
- MongoDB team for database technology
- Express.js community