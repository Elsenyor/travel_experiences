# Asia Experiences

A modern travel experiences platform focused on authentic Asian destinations, built with React 19, Node.js, Express, and MySQL.

## 🚀 Tech Stack

### Backend

- **Runtime**: Node.js 18+ with ES Modules
- **Framework**: Express.js
- **Database**: MySQL 8.0.36
- **Authentication**: JWT + Google OAuth 2.0
- **ORM**: Raw SQL with mysql2 (functional paradigm)
- **API Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: React 19 with Vite
- **Admin Panel**: React Admin (for content management)
- **Styling**: CSS3, Modern UI/UX
- **i18n**: react-i18next (ES/EN)
- **SEO**: React Helmet, dynamic sitemaps
- **Auth**: JWT + Google OAuth

## 📦 Project Structure

```
asia_experiences/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models (functional)
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, validation, React Admin
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers (UUID, slugs, SEO)
│   │   └── config/          # Configuration
│   ├── db/
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Seed data
│   └── scripts/
│       └── database.manager.js  # Migration runner
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API clients
│   │   ├── context/         # React contexts
│   │   ├── locales/         # i18n translations
│   │   └── config/          # Frontend config
│   └── public/
└── README.md
```

## 🛠️ Installation

### Prerequisites

- **Node.js**: v18 or higher
- **MySQL**: v8.0.36
- **npm**: v9 or higher
- **Google Cloud Console** account (for OAuth)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/asia_experiences.git
cd asia_experiences
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend `.env`

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=asia_experiences
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# CORS
FRONTEND_URL=http://localhost:3000
```

#### Frontend `.env`

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Google+ API
   - Google People API
4. Create OAuth 2.0 credentials:
   - **Type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3001/api/v1/auth/google/callback`
5. Copy Client ID and Secret to `.env` files

### 5. Database Setup

```bash
cd backend

# Run all migrations (creates DB and tables)
npm run db:migrate

# Optional: Seed database with sample data
npm run db:seed
```

### 6. Start Development Servers

```bash
# Backend (port 3001)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm run dev
```

## 🗄️ Database Architecture

### UUID-Based Primary Keys

All tables use **UUIDs (CHAR(36))** instead of auto-increment integers for:

- **Security**: Non-sequential IDs prevent enumeration attacks
- **Privacy**: No information leakage about record volumes
- **Scalability**: Distributed ID generation without coordination
- **IDOR Prevention**: Reduces Insecure Direct Object Reference risks

### Migrations

Database uses versioned migrations for schema management:

```bash
# Run pending migrations
npm run db:migrate

# Reset database (CAUTION: deletes all data)
npm run db:reset
```

**Migration Files** (`backend/db/migrations/`):

- `001` - Initial schema (users table with UUID + OAuth)
- `004-019` - Core tables (trips, articles, bookings, newsletter, chat, FAQs)
- `020` - Add slug fields to trips and articles
- `021` - Populate slugs for existing records

### Key Tables

| Table                    | Description                      | UUID | Multilang  |
| ------------------------ | -------------------------------- | ---- | ---------- |
| `users`                  | User accounts with OAuth support | ✅   | ❌         |
| `trips`                  | Travel packages                  | ✅   | ✅ (ES/EN) |
| `trip_translations`      | Trip content translations        | -    | ✅         |
| `articles`               | Blog articles                    | ✅   | ✅ (ES/EN) |
| `bookings`               | Trip reservations                | ✅   | ❌         |
| `newsletter_subscribers` | Email subscribers                | ✅   | ❌         |
| `faqs`                   | Frequently asked questions       | ✅   | ✅ (ES/EN) |

## 🔐 Authentication

### Local Auth

- Email + password registration/login
- Password hashing with bcrypt
- JWT access tokens (15 min expiry)
- Refresh tokens (7 days, httpOnly cookies)

### Google OAuth

- One-click "Continue with Google"
- Automatic user creation
- Profile photo sync
- Secure callback handling

### Protected Routes

```javascript
// Backend middleware
import { authenticate } from "./middlewares/auth.middleware.js";

router.get("/protected", authenticate, controller);
```

## 🎨 React Admin Panel

The backend is **fully compatible with React Admin** for easy content management.

### Features

- **CRUD Operations**: All resources (trips, articles, bookings, users)
- **Pagination**: Content-Range headers, offset/limit support
- **Filtering**: Multi-field filters, search
- **Sorting**: Multi-column sorting
- **Bulk Actions**: Delete/update multiple records
- **Relations**: Nested data (translations, images, dates)

### React Admin Middlewares

```javascript
// Applied to admin routes
import { transformReactAdminParams } from "./middlewares/react-admin.middleware.js";
import { setContentRange } from "./middlewares/content-range.middleware.js";

router.get("/trips", transformReactAdminParams, getAllTrips);
```

**Transformation**:

- `_start=0&_end=10` → `offset=0&limit=10`
- `_sort=price&_order=DESC` → `sortField=price&sortOrder=DESC`
- `q=japan` → `search=japan`

## 🌍 Internationalization (i18n)

### Static Content (Frontend)

- **Library**: react-i18next
- **Languages**: Spanish (ES), English (EN)
- **Files**: `frontend/src/locales/{en,es}.json`

### Dynamic Content (Database)

- **Translation tables**: `trip_translations`, `article_translations`, `faq_translations`
- **Language field**: `language` ('es' | 'en')
- **Automatic slug generation**: Based on ES title with EN fallback

### Example: Fetching Trips in Spanish

```javascript
// API call
GET /api/v1/trips?language=es

// Returns trips with Spanish translations
{
  "id": "uuid-here",
  "slug": "viaje-a-japon",
  "destination": "Japan",
  "title": "Viaje a Japón", // ES
  "description": "Descubre Japón..." // ES
}
```

## 🔍 SEO Optimization

### Dynamic Sitemap Generation

```bash
# Endpoints
GET /sitemap.xml          # Main sitemap
GET /sitemap-trips.xml    # All trips
GET /sitemap-articles.xml # All blog posts
```

**Features**:

- Auto-generated from database
- Multilanguage support (hreflang)
- Priority and change frequency
- Last modification dates

### Robots.txt

```bash
GET /robots.txt
```

Dynamically generated to control crawler access.

### Slug-Based URLs

All content uses SEO-friendly slugs:

- **Trips**: `/trips/authentic-japan-adventure`
- **Articles**: `/blog/best-temples-in-kyoto`
- **Automatic generation**: From title (ES preferred, EN fallback)
- **Uniqueness**: Enforced at database level

### Meta Tags & Schema.org

- React Helmet for dynamic meta tags
- JSON-LD structured data for rich snippets
- Open Graph and Twitter Cards

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm test

# Coverage report
npm run test:coverage
```

## 📚 API Documentation

### Swagger UI

```bash
# Start backend and visit:
http://localhost:3001/api-docs
```

### Key Endpoints

| Method | Endpoint                       | Description             | Auth   |
| ------ | ------------------------------ | ----------------------- | ------ |
| POST   | `/api/v1/auth/register`        | Register new user       | Public |
| POST   | `/api/v1/auth/login`           | Login with credentials  | Public |
| GET    | `/api/v1/auth/google`          | Initiate Google OAuth   | Public |
| GET    | `/api/v1/trips`                | List trips (paginated)  | Public |
| GET    | `/api/v1/trips/:slug`          | Get trip by slug        | Public |
| POST   | `/api/v1/trips`                | Create trip             | Admin  |
| GET    | `/api/v1/articles`             | List articles           | Public |
| POST   | `/api/v1/bookings`             | Create booking          | User   |
| GET    | `/api/v1/bookings/my`          | User's bookings         | User   |
| POST   | `/api/v1/newsletter/subscribe` | Subscribe to newsletter | Public |

## 🚢 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build  # If using TypeScript
npm start

# Frontend
cd frontend
npm run build
# Serve 'dist' folder with nginx/Apache
```

### Environment Variables (Production)

Update `.env` with production values:

- **Database**: Production MySQL credentials
- **CORS**: Production frontend URL
- **JWT Secrets**: Strong random secrets
- **Google OAuth**: Production callback URLs

### Database Migration (Production)

```bash
# On production server
cd backend
npm run db:migrate
```

## 🔧 Development Guidelines

### Git Workflow

1. Create feature branch from `dev`
2. Implement changes following functional paradigm
3. Write tests for new features
4. Create PR to `dev`
5. After review, merge to `dev`
6. Merge `dev` to `main` for releases

### Code Style

- **Language**: Code in English, comments in English
- **Paradigm**: Functional programming (export functions, not classes)
- **ES Modules**: Always use `import/export`
- **Async/await**: Prefer over callbacks
- **Validation**: Server-side validation for all inputs
- **Security**: Parameterized queries, never string concatenation

### Database Conventions

- **Table names**: Snake_case, plural (e.g., `trip_translations`)
- **Column names**: Snake_case (e.g., `created_at`)
- **Primary keys**: UUIDs (CHAR(36))
- **Foreign keys**: Explicit naming (e.g., `trip_id`, `user_id`)
- **Timestamps**: `created_at`, `updated_at` on all tables

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env
# Ensure database exists (migration should create it)
```

### Migration Errors

```bash
# Reset database (CAUTION: deletes all data)
npm run db:reset

# Run migrations again
npm run db:migrate
```

### Google OAuth Not Working

- Verify Client ID and Secret in `.env`
- Check authorized redirect URIs in Google Console
- Ensure callback URL matches exactly

### Port Already in Use

```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Or change PORT in .env
```

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

- Development Team

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for authentic travel experiences**
