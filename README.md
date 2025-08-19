# Asia Experiences

Travel experiences platform focused on Asian destinations.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL
- Google Cloud Console account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/asia_experiences.git
cd asia_experiences
```

2. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configure environment variables:

```bash
# Backend
cp .env.example .env
# Edit .env with your configuration
```

4. Setup Google OAuth:

a. Go to [Google Cloud Console](https://console.cloud.google.com)
b. Create a new project or select existing one
c. Enable APIs & Services:

- Google+ API
- Google People API
  d. Create OAuth 2.0 credentials:
- Go to Credentials → Create Credentials → OAuth 2.0 Client ID
- Select "Web application"
- Add Authorized JavaScript origins:
  ```
  http://localhost:3000
  ```
- Add Authorized redirect URIs:
  ```
  http://localhost:3001/api/v1/auth/google/callback
  ```
- Copy the Client ID and Client Secret to your .env file

5. Initialize database:

```bash
cd backend
npm run db
```

6. Start the application:

```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

## Authentication Methods

### Local Authentication

- Register with email and password
- Login with email and password

### Google Authentication

- Click "Continue with Google"
- Authorize the application
- Automatic registration/login

## Development Guidelines

### Git Workflow

1. Create feature branch from dev
2. Implement changes
3. Create PR to dev
4. After review, merge to dev
5. Merge dev to main for releases

### Database Migrations

- New migrations in /backend/db
- Run with `npm run db`

### Environment Variables

See `.env.example` for required configuration.

## Security Notes

- Refresh tokens stored in httpOnly cookies
- Access tokens stored in memory
- Google OAuth configured with secure redirect URIs
- Rate limiting implemented on auth endpoints
