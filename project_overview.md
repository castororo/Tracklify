# Tracklify Project Overview

## 1. Project Description
**Tracklify** is a modern, full-stack project management and collaboration dashboard designed to help teams track projects, tasks, and productivity. It features a sleek, responsive user interface and a robust backend API.

## 2. Technology Stack

### Frontend
*   **Framework**: React (v18) with TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS with custom configuration
*   **UI Library**: shadcn/ui (Radix UI primitives) and Lucide React (icons)
*   **State Management**: React Context (AuthContext, ThemeContext)
*   **Data Fetching**: Native Fetch API with custom service layer
*   **Routing**: React Router DOM (v6)
*   **Animations**: GSAP (GreenSock) and CSS transitions
*   **Charts**: Recharts

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB with Mongoose (ODM)
*   **Authentication**: JSON Web Tokens (JWT) & bcryptjs for password hashing
*   **Environment Management**: dotenv

## 3. Key Features Required & Implemented

### Authentication & User Management
*   **Secure Signup/Login**: Users can register and log in securely. Passwords are hashed.
*   **JWT Authorization**: All private API routes are protected via a custom middleware that verifies JWT tokens.
*   **Profile Management**: Users can update their profile (name, email) in the Settings page.

### Dashboard
*   **Real-time Stats**: Displays active projects, completed tasks, and team productivity.
*   **Activity Feed**: Shows recent actions (tasks completed, projects created) fetched actively from the backend.
*   **Productivity Charts**: Visualizes weekly productivity using Recharts.

### Project Management
*   **Project Listing**: View all projects with progress bars, deadlines, and status badges.
*   **Project Creation**: Users can create new projects via a modal dialog with validation.
*   **Project Details**: Dedicated page (`/projects/:id`) showing project stats and a Kanban-style task board.

### Task Management
*   **Task Board**: Tasks are organized by status (Todo, In Progress, Completed).
*   **Task Creation**: "Add Task" feature allows adding tasks to specific projects with priorities and due dates.
*   **Backend Integration**: Tasks are linked to specific projects in the database.

## 4. Development Approach & Methodology

The project was evolved from a frontend-only mock prototype to a fully functional full-stack application ('MERN' stack).

1.  **Phase 1: UI/UX Design**:
    *   Established a "Glassmorphism" inspired design system using Tailwind.
    *   Built reusable components (Cards, Buttons, Inputs) using shadcn/ui.
    *   Mocked data structures to design the interface without backend dependencies.

2.  **Phase 2: Backend Architecture**:
    *   Set up a scalable folder structure (`server/routes`, `server/models`, `server/middleware`).
    *   Designed MongoDB Schemas for `User`, `Project`, `Task`, and `Activity`.
    *   Implemented RESTful API endpoints.

3.  **Phase 3: Integration**:
    *   Replaced mock data services in `src/services/api.ts` with real `fetch` calls.
    *   Implemented JWT handling in the frontend (storing tokens, attaching headers).
    *   Connected individual pages (Dashboard, Projects, Settings) to live data.

4.  **Phase 4: Refinement**:
    *   Added error handling and loading states.
    *   Fixed routing issues (e.g., Project Details 404s).
    *   Polished UI interactions (Dialogs with Date Pickers).

## 5. Folder Structure

```
Tracklify/
├── server/                     # Backend Node.js/Express Application
│   ├── middleware/             # Custom middleware (auth.js)
│   ├── models/                 # Mongoose Schemas (User, Project, Task, Activity)
│   ├── routes/                 # API Route Definitions (projects.js, auth.js, etc.)
│   ├── index.js                # Server entry point
│   ├── package.json            # Backend dependencies
│   └── .env                    # Backend secrets (MONGO_URI, JWT_SECRET)
│
├── src/                        # Frontend React Application
│   ├── components/
│   │   ├── charts/             # Recharts components
│   │   ├── common/             # Shared UI (ActivityFeed, StatusBadge, etc.)
│   │   ├── layout/             # Layout wrappers (DashboardLayout, Navbar)
│   │   ├── projects/           # Project-specific components (CreateProjectDialog)
│   │   ├── tasks/              # Task-specific components (CreateTaskDialog)
│   │   └── ui/                 # Core Design System (shadcn/ui primitives)
│   │
│   ├── context/                # React Context Providers (AuthContext, ThemeContext)
│   ├── data/                   # Mock data (legacy/fallback)
│   ├── hooks/                  # Custom hooks (use-toast, use-mobile)
│   ├── pages/                  # Page Components (Dashboard, Projects, Login, etc.)
│   ├── services/               # API Communication Layer (api.ts)
│   ├── types/                  # TypeScript Data Interfaces
│   ├── App.tsx                 # Main Application Router
│   └── main.tsx                # Entry point
│
├── public/                     # Static assets
└── package.json                # Frontend dependencies
```

## 6. Development Commands

*   **Frontend**: `npm run dev` (Runs Vite server on port 8080)
*   **Backend**: `npm run dev` (Runs Express server on port 5000 with Nodemon)
*   **Database**: Requires a running MongoDB instance (Local or Atlas).
