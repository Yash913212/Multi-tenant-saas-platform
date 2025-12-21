# Quick Start Guide - React Frontend

## Installation & Running

### Step 1: Navigate to Frontend Directory
```bash
cd c:\Users\yaswa\OneDrive\Desktop\Multi-tenant-saas-platform\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- react (^18.2.0)
- react-dom (^18.2.0)
- react-router-dom (^6.8.0)
- axios (^1.3.2)
- react-icons (^4.7.1)
- tailwindcss (^3.2.4)
- react-scripts (5.0.1)

### Step 3: Start Development Server
```bash
npm start
```

The application will automatically open at `http://localhost:3000`

### Step 4: Ensure Backend is Running
The backend API must be running on `http://localhost:5000`

If not running, start it in another terminal:
```bash
cd backend
node index.js
```

---

## What You Can Do

### Test Registration
1. Go to http://localhost:3000/register
2. Fill in:
   - Organization Name: "Your Company"
   - Subdomain: "yourcompany"
   - Admin Email: "admin@yourcompany.com"
   - Password: "password123"
3. Click "Create Account"

### Test Login
1. Go to http://localhost:3000/login
2. Use credentials from registration
3. Click "Login"

### Explore Dashboard
- View statistics
- See recent projects
- Check tasks

### Manage Projects
- Create new projects
- Edit project details
- Delete projects
- View project tasks

### Manage Tasks
- Add tasks to projects
- Edit task details
- Change task status
- Delete tasks

### Manage Users (Admin Only)
- Add new team members
- Edit user roles
- Delete users
- Filter by role

---

## Project Structure at a Glance

```
frontend/
├── src/
│   ├── pages/          → 6 main pages
│   ├── components/     → Reusable UI components
│   ├── context/        → Auth state management
│   ├── hooks/          → Custom React hooks
│   ├── services/       → API client
│   ├── utils/          → Helpers & constants
│   ├── App.jsx         → Main app with routing
│   └── index.js        → React entry point
├── public/
│   └── index.html      → HTML template
├── .env                → Environment variables
├── package.json        → Dependencies
└── tailwind.config.js  → Tailwind CSS config
```

---

## API Base URL

The frontend connects to:
```
http://localhost:5000/api
```

To change this, edit `.env` file:
```
REACT_APP_API_URL=http://your-api-url/api
```

---

## Key Features

✓ Responsive design (mobile, tablet, desktop)
✓ User authentication with JWT
✓ Project management
✓ Task tracking
✓ User administration
✓ Real-time search and filtering
✓ Form validation
✓ Error handling
✓ Loading states

---

## Common Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (if configured)
npm test

# Eject configuration (not recommended)
npm eject
```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## Troubleshooting

### Port 3000 already in use?
Use a different port:
```bash
PORT=3001 npm start
```

### API connection refused?
1. Check backend is running on port 5000
2. Verify REACT_APP_API_URL in .env

### Styles look broken?
Clear cache and reinstall:
```bash
npm install
npm start
```

---

## Next Steps

1. **Customize branding** - Update app name in Navbar
2. **Add your logo** - Replace app icon in Navbar
3. **Deploy to production** - Use Vercel, Netlify, or your host
4. **Add more features** - Extend pages and components
5. **Integrate with your backend** - Ensure all API endpoints match

---

For detailed documentation, see `README.md` and `IMPLEMENTATION_COMPLETE.md`
