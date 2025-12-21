# SaaS Platform Frontend

Complete React frontend application for the multi-tenant SaaS platform.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created with default values):
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Common/          # Reusable components (Button, Card, Modal, etc.)
│   │   ├── Forms/           # Form components (ProjectForm, TaskForm, UserForm)
│   │   └── Layout/          # Layout components (Navbar, ProtectedRoute)
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── hooks/
│   │   └── useAuth.js       # Custom auth hook
│   ├── pages/
│   │   ├── Register.jsx     # Registration page
│   │   ├── Login.jsx        # Login page
│   │   ├── Dashboard.jsx    # Dashboard page
│   │   ├── Projects.jsx     # Projects list page
│   │   ├── ProjectDetails.jsx # Project details page
│   │   └── Users.jsx        # Users management page
│   ├── services/
│   │   └── api.js           # Axios API client with interceptors
│   ├── utils/
│   │   ├── constants.js     # Constants (endpoints, roles, statuses)
│   │   └── helpers.js       # Helper functions (date formatting, validation)
│   ├── App.jsx              # Main app component with routing
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables
├── package.json
└── tailwind.config.js       # Tailwind CSS configuration
```

## Features

### Authentication
- Register new tenant organizations
- Login with email and password
- Auto token refresh and logout on 401
- Protected routes with role-based access

### Dashboard
- Overview statistics (total projects, tasks, completed/pending)
- Recent projects display
- Task filtering by status
- Quick access to main features

### Projects Management
- Create, read, update, delete projects
- Filter by status and search by name
- Task count for each project
- Responsive grid layout

### Task Management
- Create, edit, delete tasks within projects
- Filter by status and priority
- Assign tasks to team members
- Due date tracking
- Status change from task card

### User Management (Admin Only)
- Add new users to tenant
- Edit user details and roles
- Delete users
- Filter by role and search by name/email
- Pagination support

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Dark mode friendly styling with Tailwind CSS
- Loading states on all buttons and pages
- Error messages and success notifications
- Form validation (client-side)
- Empty states for better UX
- Confirmation modals for destructive actions

## API Integration

The frontend integrates with the SaaS backend API endpoints:

- **Auth**: `/api/auth/register-tenant`, `/api/auth/login`, `/api/auth/me`
- **Projects**: `/api/projects`, `/api/projects/:id`
- **Tasks**: `/api/tasks`, `/api/projects/:id/tasks`
- **Users**: `/api/users`, `/api/tenants/:id/users`

All API requests include JWT token in Authorization header automatically.

## Technologies Used

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

## Development Notes

### Form Validation
All forms include client-side validation with error messages. Validation rules are in `src/utils/helpers.js`.

### State Management
Uses React Context API for authentication state. Component state managed with useState.

### API Error Handling
Global error interceptor in `src/services/api.js` handles 401 errors and redirects to login.

### Styling
Uses Tailwind CSS utility classes for responsive, consistent design. Custom colors defined in `tailwind.config.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React Router
- Lazy loading of routes
- Image optimization
- CSS minification in production build

## Troubleshooting

### API Connection Issues
Ensure backend is running on `http://localhost:5000` and `REACT_APP_API_URL` is set correctly.

### Authentication Issues
Check browser console for JWT token in localStorage. Clear localStorage if experiencing persistent issues.

### Styling Issues
Ensure Tailwind CSS is properly compiled. Run `npm install` to reinstall dependencies.

## License

MIT
