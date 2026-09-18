# CodeAlpha_SocialMediaPlatform

**CodeAlpha Full Stack Development Internship — Task 2: Social Media Platform**

**Circle** — a mini social media app with user profiles, posts & comments, and a
like/follow system.

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT-based registration/login with bcrypt-hashed passwords

## Features

- User registration & login (JWT auth)
- User profiles with bio, avatar color, and follower/following counts
- Follow / unfollow other users
- Create posts, view a global feed
- Like / unlike posts
- Comment on posts
- Edit your own profile; delete your own posts

## Project structure

```
CodeAlpha_SocialMediaPlatform/
├── backend/           Express API server
│   ├── config/        MongoDB connection
│   ├── controllers/   auth, users, posts, comments
│   ├── middleware/    JWT auth guard (+ optional-auth), error handling
│   ├── models/        Mongoose schemas: User, Post, Comment
│   ├── routes/        /api/auth, /api/users, /api/posts, /api/comments
│   ├── seed/          Sample users/posts/comments seeder
│   └── server.js      App entry point (also serves the frontend)
├── frontend/          Static HTML/CSS/JS client
│   ├── css/style.css
│   ├── js/            api.js, nav.js, post-render.js, and one file per page
│   └── *.html         index (feed), profile, login, register
└── docker-compose.yml MongoDB container for local development
```

## Getting started

### 1. Start MongoDB

```bash
docker compose up -d
```

Runs MongoDB on `mongodb://127.0.0.1:27018` (a different port from other
CodeAlpha projects so they can run side by side). No Docker? Use the
Docker-free fallback instead:

```bash
cd backend
npm run mongo
```

This boots a real local MongoDB via `mongodb-memory-server` — no install
required, data persists to `backend/.mongo-data`.

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

### 3. Install dependencies

```bash
npm install
```

### 4. Seed sample data (optional but recommended)

```bash
npm run seed
```

Creates 3 sample users (with a follow relationship, some posts, likes and
comments already in place). Sample login: `ayesha@example.com` / `password123`.

### 5. Run the server

```bash
npm run dev
```

The app is served at **http://localhost:5001** — Express serves both the
REST API (`/api/...`) and the static frontend. (Port 5001 by default so it
can run alongside other CodeAlpha projects on the same machine.)

## API overview

| Method | Endpoint                     | Description                          | Auth        |
|--------|-------------------------------|---------------------------------------|-------------|
| POST   | `/api/auth/register`          | Create an account                     | Public      |
| POST   | `/api/auth/login`              | Log in, returns a JWT                 | Public      |
| GET    | `/api/auth/profile`            | Current user's profile                | Required    |
| GET    | `/api/users/:username`         | Public profile by username            | Optional*   |
| GET    | `/api/users/:username/posts`   | A user's posts                        | Public      |
| PUT    | `/api/users/me/profile`        | Update your own profile               | Required    |
| POST   | `/api/users/:username/follow`  | Follow / unfollow a user (toggle)     | Required    |
| GET    | `/api/posts`                   | Global feed (most recent first)       | Optional*   |
| POST   | `/api/posts`                   | Create a post                         | Required    |
| GET    | `/api/posts/:id`               | Single post                           | Optional*   |
| DELETE | `/api/posts/:id`               | Delete your own post                  | Required    |
| POST   | `/api/posts/:id/like`          | Like / unlike a post (toggle)         | Required    |
| GET    | `/api/posts/:postId/comments`  | List comments on a post               | Public      |
| POST   | `/api/posts/:postId/comments`  | Add a comment                         | Required    |
| DELETE | `/api/comments/:id`            | Delete your own comment               | Required    |

\* Optional auth: works whether or not you're logged in, but returns extra
viewer-specific fields (e.g. `liked`, `isFollowing`) when you are.
