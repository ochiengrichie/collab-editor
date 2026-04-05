# Collaborative Document Editor - Client

A real-time collaborative document editing application built with React and Vite. This frontend allows users to create, edit, and collaboratively work on documents with real-time synchronization, role-based access control, and live user presence indicators.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Key Technologies](#key-technologies)
- [Architecture Overview](#architecture-overview)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Real-time Features](#real-time-features)
- [Authentication](#authentication)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Secure login/registration with Google OAuth integration
- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live updates
- **Document Management**: Create, read, update, and delete documents
- **Role-Based Access Control**: Owner, editor, and viewer roles with granular permissions
- **Member Invitations**: Invite team members to collaborate on documents
- **Live Presence**: See who is currently editing and online users
- **Auto-save**: Documents are automatically persisted to the server
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **ESLint Configuration**: Code quality enforcement and best practices

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn/pnpm as alternatives)
- **Backend Server**: The collaborative editor backend running on `http://localhost:5000` (or configured endpoint)
- **Google OAuth Credentials** (for authentication feature)

## 🚀 Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd collab-editor/Client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root of the Client directory (optional for development):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Ensure backend server is running**:
   - The backend server should be running on `http://localhost:5000`
   - See the Server directory README for setup instructions

## 🎯 Getting Started

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to `http://localhost:5173` (default Vite development port)

3. **Register or Login**:
   - Create a new account or log in with existing credentials
   - Use Google OAuth for quick authentication

4. **Create a Document**:
   - From the dashboard, click "Create New Document"
   - Start typing in the editor

5. **Invite Collaborators**:
   - Click the Members button in the editor
   - Enter team members' email addresses
   - Assign appropriate roles (owner, editor, viewer)

6. **Real-time Editing**:
   - Changes sync automatically across all connected users
   - See live presence indicators of active editors

## 📝 Available Scripts

- **`npm run dev`** - Start the development server with HMR (Hot Module Replacement)
- **`npm run build`** - Build the project for production in the `dist/` directory
- **`npm run lint`** - Run ESLint to check and report code quality issues
- **`npm run preview`** - Preview the production build locally

## 📁 Project Structure

```
Client/
├── src/
│   ├── api/                 # API integration modules
│   │   ├── auth.api.js      # Authentication endpoints
│   │   ├── client.js        # Axios client configuration
│   │   ├── docs.api.js      # Document endpoints
│   │   └── members.api.js   # Member management endpoints
│   ├── assets/              # Static assets
│   ├── Components/          # React components
│   │   ├── Docs/            # Document-related components
│   │   │   ├── CreateDocModal.jsx
│   │   │   ├── DocCard.jsx
│   │   │   └── DocList.jsx
│   │   └── Layout/          # Layout components
│   │       ├── Navbar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── context/             # React Context (state management)
│   │   └── AuthContext.jsx
│   ├── cssStyles/           # Global styles
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Auth context hook
│   │   └── useSocket.js     # Socket connection hook
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Editor.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── SideBar.jsx
│   ├── realtime/            # Real-time communication
│   │   └── socket.js        # Socket.io client setup
│   ├── Utils/               # Utility functions and constants
│   │   ├── Constants.jsx
│   │   └── Validators.jsx
│   ├── App.jsx              # Root application component
│   ├── App.css              # App-level styles
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   └── routes.jsx           # Route definitions
├── public/                  # Public assets
├── package.json             # Project dependencies and scripts
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # This file
```

## 🛠 Key Technologies

| Technology | Version | Purpose |
|---|---|---|
| **React** | ^19.2.0 | UI library |
| **Vite** | 7.2.5 | Build tool & dev server |
| **React Router** | ^7.13.0 | Client-side routing |
| **Socket.io Client** | ^4.8.3 | Real-time communication |
| **Axios** | ^1.13.4 | HTTP client |
| **React OAuth** | ^0.13.4 | Google authentication |
| **ESLint** | ^9.39.1 | Code linting |

## 🏗 Architecture Overview

### Component Hierarchy

```
App (routes.jsx)
├── ProtectedRoute
│   ├── Dashboard
│   │   ├── Navbar
│   │   ├── DocList
│   │   ├── CreateDocModal
│   │   ├── Header
│   │   ├── SideBar
│   │   └── Footer
│   └── Editor
│       ├── Modern Editor UI
│       ├── Member Management
│       ├── Online Users List
│       └── Auto-save Status
├── Login
├── Register
└── Not Found (404)
```

### Data Flow

1. **Authentication**: User logs in → AuthContext stores user info
2. **Document Fetching**: Dashboard fetches docs → displayed in DocList
3. **Real-time Updates**: Editor connects to Socket.io → receives live updates
4. **Member Management**: Invite/update members → API calls → Socket broadcasts
5. **Document Persistence**: Changes auto-saved to backend via Socket queue

## ⚙️ Configuration

### Vite Configuration

The project uses Vite with React plugin for fast development and building:

- **HMR (Hot Module Replacement)**: Enabled for instant dev feedback
- **Plugin**: `@vitejs/plugin-react` for Fast Refresh

### ESLint Configuration

Code quality checks include:
- React hooks rules
- React refresh plugin checks
- Global variable definitions

To run linting:
```bash
npm run lint
```

## 🔌 API Integration

All API calls are handled through the `src/api/` directory:

- **Auth API**: Login, registration, token management
- **Docs API**: CRUD operations for documents
- **Members API**: Invite, list, update roles, remove members

The `client.js` file configures the Axios instance with base URL and interceptors.

## 📡 Real-time Features

### Socket.io Integration

Real-time features are powered by Socket.io:

- **Live Editing**: Content updates stream to all connected users
- **Presence**: See who is currently editing
- **Notifications**: Real-time alerts for member invitations and document changes
- **Auto-save Queue**: Changes are queued and persisted efficiently

Connection established in `src/realtime/socket.js`

## 🔐 Authentication

Authentication is handled through:

1. **Local Auth**: Email/password registration and login
2. **Google OAuth**: Quick login with Google account
3. **JWT Tokens**: Stored in localStorage for API authentication
4. **Protected Routes**: Only authenticated users can access editor and dashboard

Auth context available via `useAuth()` hook

## 🐛 Troubleshooting

### Common Issues

**Issue**: Development server won't start
- **Solution**: Ensure Node.js v16+ is installed and all dependencies are installed with `npm install`

**Issue**: Cannot connect to backend
- **Solution**: Verify backend server is running on `http://localhost:5000` and environment variables are set correctly

**Issue**: Real-time updates not working
- **Solution**: Check Socket.io connection in browser DevTools Network tab; ensure backend socket server is running

**Issue**: Authentication fails
- **Solution**: Clear browser cache/cookies, verify Google OAuth credentials are configured

**Issue**: ESLint errors during development
- **Solution**: Run `npm run lint` to see detailed errors and fix issues

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is part of a collaborative document editor application. See the main project repository for license information.

## 📞 Support

For issues, questions, or suggestions, please refer to the backend Server README for additional context and contact information.
