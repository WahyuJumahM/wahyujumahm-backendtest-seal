# 🤖 Chatbot API

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![AdonisJS](https://img.shields.io/badge/AdonisJS-5-purple.svg)](https://adonisjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4+-blue.svg)](https://typescriptlang.org/)


REST API sederhana menggunakan AdonisJS 5 dan PostgreSQL untuk sistem chatbot yang terintegrasi dengan API eksternal MajaDigiDev. API ini memungkinkan pengguna mengirimkan pertanyaan, menyimpan conversation, dan mengelola messages dengan dokumentasi lengkap menggunakan Swagger UI.

## 🚀 Features

- ✅ **Chatbot Integration** - Integrasi dengan API eksternal MajaDigiDev
- ✅ **Conversation Management** - Kelola conversations dan messages
- ✅ **Session Management** - UUID-based session tracking
- ✅ **Pagination & Filtering** - Advanced search dan pagination
- ✅ **Basic Authentication** - Keamanan untuk endpoint protected
- ✅ **Input Validation** - Validasi menggunakan AdonisJS Validator
- ✅ **Database Migrations** - PostgreSQL dengan Lucid ORM
- ✅ **Swagger Documentation** - Interactive API documentation
- ✅ **Health Check** - Monitoring endpoint
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Transaction Support** - Database transaction untuk data consistency

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | AdonisJS 5 |
| Database | PostgreSQL |
| ORM | Lucid ORM |
| Validation | AdonisJS Validator |
| HTTP Client | Axios |
| Authentication | Basic Auth |
| Documentation | Swagger UI + OpenAPI 3.0 |
| Language | TypeScript |

## 📋 Prerequisites

Pastikan sistem Anda memiliki:

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **PostgreSQL** v12+ ([Download](https://postgresql.org/download/))
- **npm** atau **yarn**
- **Git**

Verifikasi instalasi:
```bash
node --version    # v16.0.0+
npm --version     # 8.0.0+
psql --version    # PostgreSQL 12+
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd chatbot-api
```

### 2. Install Dependencies
```bash
# Install semua dependencies
npm install

# Atau menggunakan yarn
yarn install
```

### 3. Setup Database PostgreSQL

**Menggunakan PostgreSQL CLI:**
```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database baru
CREATE DATABASE chatbot_db;

# Buat user baru (opsional)
CREATE USER chatbot_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;

# Exit
\q
```

**Menggunakan pgAdmin:**
1. Buka pgAdmin
2. Connect ke PostgreSQL server
3. Klik kanan pada "Databases" → "Create" → "Database"
4. Nama database: `chatbot_db`
5. Save

### 4. Environment Configuration

```bash
# Copy file environment
cp .env.example .env

# Generate APP_KEY
node ace generate:key
```

Edit file `.env` dengan konfigurasi Anda:
```env
# Server Configuration
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=your-generated-app-key-here
DRIVE_DISK=local
SESSION_DRIVER=cookie
CACHE_VIEWS=false

# Database Configuration
DB_CONNECTION=pg
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_database_password
PG_DB_NAME=chatbot_db

# External API Configuration
EXTERNAL_API_URL=https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message

# Basic Authentication (untuk endpoint protected)
API_USERNAME=admin
API_PASSWORD=password123
```

### 5. Database Setup

```bash
# Install dan configure Lucid (jika belum)
node ace configure @adonisjs/lucid

# Install dan configure Validator
node ace configure @adonisjs/validator

# Jalankan migrations
node ace migration:run

# Cek status migrations
node ace migration:status
```

### 6. Start Development Server

```bash
# Development mode dengan auto-reload
npm run dev

# Atau
node ace serve --watch
```

Server akan berjalan di: **http://localhost:3333**

### 7. Verifikasi Installation

```bash
# Test health endpoint
curl http://localhost:3333/health

# Test API info
curl http://localhost:3333/

# Akses Swagger documentation
# Buka browser: http://localhost:3333/api-docs
```

## 📚 API Documentation

### 🌐 Access Points

| Endpoint | Description |
|----------|-------------|
| `http://localhost:3333` | API Information |
| `http://localhost:3333/api-docs` | Swagger UI Documentation |
| `http://localhost:3333/health` | Health Check |

### 🔐 Authentication

Endpoint yang memerlukan authentication menggunakan Basic Auth:

```bash
# Format header
Authorization: Basic <base64(username:password)>

# Default credentials (dari .env)
Username: admin
Password: password123

# Generate base64 encoding
echo -n "admin:password123" | base64
# Output: YWRtaW46cGFzc3dvcmQxMjM=
```

### 📝 API Endpoints

#### 🔓 Public Endpoints

**POST /questions**
Kirim pertanyaan ke chatbot

```bash
curl -X POST "http://localhost:3333/questions" \
     -H "Content-Type: application/json" \
     -d '{
       "question": "Apa itu artificial intelligence?",
       "session_id": "550e8400-e29b-41d4-a716-446655440000",
       "additional_information": ""
     }'
```

Response:
```json
{
  "success": true,
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_id": 1,
    "user_message": "Apa itu artificial intelligence?",
    "bot_response": "Artificial Intelligence adalah teknologi...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 🔒 Protected Endpoints (Require Auth)

**GET /conversations**
Ambil semua conversations dengan pagination

```bash
curl -X GET "http://localhost:3333/conversations?page=1&limit=10&search=AI" \
     -H "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM="
```

Query Parameters:
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10)
- `search`: Pencarian berdasarkan session_id atau last_message
- `sort_by`: Field untuk sorting (default: created_at)
- `sort_order`: asc atau desc (default: desc)

**GET /conversations/{id}**
Ambil messages dari conversation tertentu

```bash
# Menggunakan conversation ID
curl -X GET "http://localhost:3333/conversations/1" \
     -H "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM="

# Menggunakan session ID (UUID)
curl -X GET "http://localhost:3333/conversations/550e8400-e29b-41d4-a716-446655440000" \
     -H "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM="
```

**DELETE /conversations/{id}**
Hapus conversation dan semua messages terkait

```bash
curl -X DELETE "http://localhost:3333/conversations/1" \
     -H "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM="
```

**DELETE /messages/{id}**
Hapus message tertentu

```bash
curl -X DELETE "http://localhost:3333/messages/1" \
     -H "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM="
```

## 📁 Project Structure

```
chatbot-api/
├── app/
│   ├── Controllers/
│   │   └── Http/
│   │       └── ChatbotController.ts     # Main API controller
│   ├── Middleware/
│   │   └── BasicAuth.ts                 # Authentication middleware
│   ├── Models/
│   │   ├── Conversation.ts              # Conversation model
│   │   └── Message.ts                   # Message model
│   ├── Services/
│   │   └── ChatbotService.ts            # External API service
│   └── Validators/
│       └── QuestionValidator.ts         # Input validation
├── config/
│   ├── database.ts                      # Database configuration
│   └── swagger.ts                       # Swagger documentation config
├── database/
│   └── migrations/
│       ├── 001_conversations.ts         # Conversation table migration
│       └── 002_messages.ts              # Messages table migration
├── start/
│   ├── kernel.ts                        # Middleware registration
│   └── routes.ts                        # API routes definition
├── .env                                 # Environment variables
├── package.json                         # Dependencies
└── README.md                            # Documentation
```

## 🗃 Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  session_id UUID UNIQUE NOT NULL,
  last_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) CHECK (sender_type IN ('user', 'bot')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚧 Development Commands

```bash
# Development server dengan auto-reload
npm run dev

# Database ORM dependencies
npm install @adonisjs/lucid@^18.4.0

# Configure dependencies
node ace configure @adonisjs/lucid

# Jalankan migrations
node ace migration:run

# Check migration status
node ace migration:status
```

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3333 | No |
| `HOST` | Server host | 0.0.0.0 | No |
| `NODE_ENV` | Environment | development | No |
| `APP_KEY` | Application key | - | Yes |
| `DB_CONNECTION` | Database type | pg | Yes |
| `PG_HOST` | PostgreSQL host | localhost | Yes |
| `PG_PORT` | PostgreSQL port | 5432 | Yes |
| `PG_USER` | Database user | postgres | Yes |
| `PG_PASSWORD` | Database password | - | Yes |
| `PG_DB_NAME` | Database name | chatbot_db | Yes |
| `EXTERNAL_API_URL` | MajaDigiDev API URL | - | Yes |
| `API_USERNAME` | Basic auth username | admin | No |
| `API_PASSWORD` | Basic auth password | password123 | No |

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Pastikan PostgreSQL service berjalan
- Cek kredensial database di `.env`
- Verifikasi database `chatbot_db` sudah dibuat

```bash
# Start PostgreSQL service
# Ubuntu/Debian:
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS (Homebrew):
brew services start postgresql

# Windows:
# Start melalui Services atau PostgreSQL installer
```

#### 2. Migration Failed
```
Error: relation "conversations" does not exist
```

**Solution:**
```bash
# Reset migrations
node ace migration:rollback --batch=0
node ace migration:run
```

#### 3. External API Timeout
```
Error: External API is not responding
```

**Solution:**
- Cek koneksi internet
- Verifikasi URL API eksternal di `.env`
- Test API eksternal manual:

```bash
curl -X POST "https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message" \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "session_id": "test-123"}'
```

#### 4. Port Already in Use
```
Error: Port 3333 is already in use
```

**Solution:**
```bash
# Ubah port di .env
PORT=3334

# Atau kill process yang menggunakan port
lsof -ti:3333 | xargs kill -9
```

## 📊 Monitoring & Health Check

### Health Check
```bash
# Simple health check
curl http://localhost:3333/health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345.67
}
```

### Database Monitoring
```sql
-- Active connections
SELECT * FROM pg_stat_activity WHERE datname = 'chatbot_db';

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```


## 👥 Authors

- *Wahyu Jum'ah Maulidan* - [WahyuJumahM](https://github.com/WahyuJumahM)

## 🙏 Acknowledgments

- [AdonisJS](https://adonisjs.com/) - The web framework used
- [PostgreSQL](https://postgresql.org/) - Database
- [MajaDigiDev](https://api.majadigidev.jatimprov.go.id/) - External API integration

---

**Happy Coding!** 🚀

For more information, visit my [LinkedIn](https://www.linkedin.com/in/wahyujumahm/)
