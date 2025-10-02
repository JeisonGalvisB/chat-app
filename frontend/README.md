# Chat App - Frontend

Real-time chat application frontend built with React, Vite, and Socket.IO Client.

## 🚀 Features

- **Real-time messaging** with Socket.IO
- **Private 1-to-1 conversations**
- **Online users list** with live updates
- **Message history** persistence
- **Read/unread status** tracking
- **Responsive design** for mobile and desktop
- **Modern UI/UX** with gradients and animations
- **Message bubbles** WhatsApp-style
- **Auto-scroll** to latest messages
- **Typing indicators** ready
- **Fast refresh** with Vite HMR

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) 
- **npm** (comes with Node.js)
- **Backend server** running on `http://localhost:3001` (see backend README)

## 🛠️ Installation

### 1. Navigate to Frontend Directory

```bash
cd chat-app/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `react` - UI library
- `react-dom` - React DOM rendering
- `socket.io-client` - Real-time client
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React support for Vite

### 3. Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` with your backend URL:

```env
VITE_BACKEND_URL=http://localhost:3001
```

**Important:** For production deployment, update this to your backend's production URL:

```env
VITE_BACKEND_URL=https://your-backend-url.com
```

## ▶️ Running the Application

### Development Mode

Start the development server with Hot Module Replacement:

```bash
npm run dev
```

Expected output:

```
  VITE v7.1.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.X:5173/
  ➜  press h + enter to show help
```

Open your browser and navigate to `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx            # Login screen
│   │   ├── Login.css
│   │   ├── Chat.jsx             # Main chat container
│   │   ├── Chat.css
│   │   ├── UserList.jsx         # Online users sidebar
│   │   ├── UserList.css
│   │   ├── ChatWindow.jsx       # Message window
│   │   └── ChatWindow.css
│   ├── context/
│   │   └── SocketContext.jsx   # Socket.IO context provider
│   ├── App.jsx                  # Root component
│   ├── App.css
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── .env                        # Environment variables
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🎨 Component Overview

### **Login Component**

- Nickname input with validation
- Connection status indicator
- Error handling
- Modern card design

### **Chat Component**

- Main container
- User info header
- Logout functionality
- Layout management

### **UserList Component**

- Real-time online users
- Avatar with initials
- Active user highlighting
- User count badge

### **ChatWindow Component**

- Message display (sent/received)
- Message input field
- Auto-scroll to bottom
- Timestamp formatting
- Loading states
- Error handling

### **SocketContext**

Provides global Socket.IO functionality:

```javascript
const {
  socket,           // Socket.IO instance
  connected,        // Connection status
  onlineUsers,      // Array of online users
  joinChat,         // Join with nickname
  sendMessage,      // Send message
  loadMessages,     // Load history
  markAsRead        // Mark as read
} = useSocket()
```

## 🎨 Styling

The application uses custom CSS with:

- **Gradient backgrounds** (purple to blue)
- **Modern card designs** with shadows
- **Smooth animations** and transitions
- **Responsive layouts** (mobile-first)
- **WhatsApp-style message bubbles**
- **Hover effects** and focus states

### Color Scheme

- **Primary:** `#667eea` to `#764ba2` (gradient)
- **Success:** `#4caf50`
- **Error:** `#c62828`
- **Background:** `#f5f5f5`
- **Text:** `#333`

## 🔌 Socket.IO Integration

### Connection Setup

The app automatically connects to the backend on load:

```javascript
// SocketContext.jsx
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  autoConnect: true
})
```

### Events Handled

**Emitted by Client:**
- `user:join` - Join chat
- `message:send` - Send message
- `messages:load` - Load history
- `messages:mark_read` - Mark as read

**Received by Client:**
- `users:list` - Online users update
- `message:received` - New message
- `notification:new_message` - Message notification



## 🌐 Deployment

### Environment Configuration

**Development:**
```env
VITE_BACKEND_URL=http://localhost:3001
```

**Production:**
```env
VITE_BACKEND_URL=https://api.your-domain.com
```

### Deployment Platforms

#### **Option 1: Vercel (Recommended)**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_BACKEND_URL` = Your backend URL

4. Automatic deployments on git push

**Alternative:** Connect GitHub repo directly on Vercel website.

#### **Option 2: Netlify**

1. Build the app:
```bash
npm run build
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

4. Set environment variables:
```bash
netlify env:set VITE_BACKEND_URL https://your-backend-url.com
```

**Alternative:** Drag-and-drop `dist/` folder on Netlify website.

#### **Option 3: GitHub Pages**

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/chat-app/',  // Your repo name
  plugins: [react()],
})
```

4. Deploy:
```bash
npm run deploy
```

#### **Option 4: Render**

1. Create new Static Site on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Add environment variable:
   - `VITE_BACKEND_URL` = Backend URL
5. Deploy automatically

#### **Option 5: AWS S3 + CloudFront**

1. Build the app:
```bash
npm run build
```

2. Create S3 bucket with static website hosting
3. Upload `dist/` contents to S3
4. Create CloudFront distribution
5. Configure CORS for backend API

## 🔧 Troubleshooting

### Cannot Connect to Backend

**Error:** `Socket.IO connection failed`

**Solution:**
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check `.env` file has correct `VITE_BACKEND_URL`
3. Verify CORS is enabled on backend
4. Check browser console for errors

### Vite Dev Server Won't Start

**Error:** `EADDRINUSE: port 5173 already in use`

**Solution:**
```bash
# Find process using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- --port 3000
```

### Build Errors

**Error:** `Module not found` or build fails

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Environment Variables Not Working

**Solution:**
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- For production builds, rebuild after env changes

## 🔒 Security Considerations

- All backend URLs configured via environment variables
- No sensitive data in frontend code
- Input validation on nickname
- XSS protection via React's default escaping
- CORS handled by backend

## 📱 Responsive Design

The app is fully responsive:

- **Mobile:** Single column, hamburger menu ready
- **Tablet:** Two columns (users + chat)
- **Desktop:** Three columns layout ready

Breakpoints:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## ⚡ Performance Optimization

- **Vite HMR** for instant updates during development
- **Code splitting** automatic with Vite
- **Lazy loading** components ready
- **Optimized production builds** with minification
- **Asset optimization** (images, fonts)

## 🔄 State Management

Currently using:
- **React Context API** for Socket.IO
- **Local component state** with `useState`
- **Effects** with `useEffect`

For larger apps, consider:
- Redux Toolkit
- Zustand
- Jotai


## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing library
- Vite team for blazing-fast tooling
- Socket.IO team for real-time capabilities
