# CampusConnect AI 🎓

> A modern College Event Registration & Management System — built with React + Vite, ASP.NET Core 9, and MongoDB Atlas.

---

## ✨ Features

- **Role-based auth** — Student, Faculty, Admin with JWT
- **Student dashboard** — Browse events, register, track registrations
- **Faculty dashboard** — Create, edit, delete events and view participants
- **Admin panel** — View all students, faculty, and events
- **Dark futuristic UI** — Glassmorphism, aurora gradients, Framer Motion animations
- **Responsive** — Desktop and mobile

---

## 🗂 Folder Structure

```
CampusConnectAI/
  client/       ← React + Vite frontend
  server/       ← ASP.NET Core 9 Web API backend
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- .NET 9 SDK
- MongoDB Atlas account

---

### 1. Backend Setup

```bash
cd server
cp appsettings.json appsettings.Development.json
```

Edit `appsettings.json` and replace:
- `YOUR_MONGODB_ATLAS_URI` with your MongoDB Atlas connection string
- `YourSuperSecretKeyHere_MustBe32CharsMin!` with a strong secret (32+ chars)

```bash
dotnet restore
dotnet run
```

The API starts on `http://localhost:5000`.

**Default seeded accounts:**
| Role    | Email                          | Password    |
|---------|-------------------------------|-------------|
| Admin   | admin@campusconnect.edu        | Admin@123   |
| Faculty | faculty@campusconnect.edu      | Faculty@123 |

---

### 2. Frontend Setup

```bash
cd client
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## 🌐 Deployment

### Frontend → Vercel

1. Push the `client/` folder to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-render-api.onrender.com`
4. Deploy

### Backend → Render

1. Push the `server/` folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - Build Command: `dotnet publish -c Release -o out`
   - Start Command: `dotnet out/CampusConnectAPI.dll`
4. Add Environment Variables:
   - `MongoDB__ConnectionString` = your Atlas URI
   - `Jwt__Key` = your secret key
5. Deploy

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and whitelist your IP (or 0.0.0.0/0 for Render)
3. Copy the connection string into your backend config

---

## 📡 API Reference

| Method | Endpoint                     | Auth        | Description            |
|--------|------------------------------|-------------|------------------------|
| POST   | /api/auth/register            | None        | Register student       |
| POST   | /api/auth/login               | None        | Login                  |
| GET    | /api/events                   | None        | Get all events         |
| GET    | /api/events/:id               | None        | Get event by ID        |
| POST   | /api/events                   | Faculty     | Create event           |
| PUT    | /api/events/:id               | Faculty     | Update event           |
| DELETE | /api/events/:id               | Faculty     | Delete event           |
| POST   | /api/register                 | Student     | Register for event     |
| GET    | /api/register/studentDashboard| Student     | Student stats          |
| GET    | /api/users/students           | Admin       | List all students      |
| GET    | /api/users/faculty            | Admin       | List all faculty       |

---

## 🔮 Roadmap

- QR code attendance tracking
- PDF certificate generation
- Event analytics dashboard
- Email notifications
- AI-powered event recommendations

---

## 🛠 Tech Stack

| Layer    | Tech                                        |
|----------|---------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend  | ASP.NET Core 9, MongoDB Driver              |
| Database | MongoDB Atlas                               |
| Auth     | JWT + BCrypt                                |
| Deploy   | Vercel (frontend) + Render (backend)        |
