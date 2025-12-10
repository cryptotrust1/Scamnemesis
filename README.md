# Scamnemesis

> Fraud reporting system with ML-powered duplicate detection

A comprehensive platform for reporting, tracking, and detecting fraudulent activities using machine learning and advanced duplicate detection algorithms.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 14+ with pgvector extension
- Redis 7+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Scamnemesis
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Next.js app (port 3000)
   - PostgreSQL + pgvector (port 5432)
   - Redis (port 6379)
   - Typesense (port 8108)
   - MinIO (port 9000, console 9001)
   - ML Service (port 8000)
   - ClamAV (virus scanning)

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

6. **Access the application**
   - **App**: http://localhost:3000
   - **API**: http://localhost:3000/api/v1
   - **MinIO Console**: http://localhost:9001
   - **ML Service**: http://localhost:8000/docs

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build production bundle
npm run start            # Start production server
npm run lint             # Lint code
npm run lint:fix         # Fix linting errors
npm run type-check       # TypeScript type checking
```

### Testing
```bash
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:ci          # Run tests in CI mode
```

### Database
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:migrate:deploy # Deploy migrations (production)
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

### Docker
```bash
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View app logs
npm run docker:build     # Rebuild containers
```

### Workers
```bash
npm run worker:duplicate-detection  # Run duplicate detection worker
```

## 🏗️ Project Structure

```
Scamnemesis/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/v1/          # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── reports/     # Report CRUD
│   │   │   ├── admin/       # Admin operations
│   │   │   ├── search/      # Search endpoints
│   │   │   └── images/      # Image operations
│   │   ├── (pages)/         # Frontend pages (to be implemented)
│   │   └── layout.tsx       # Root layout
│   ├── lib/                 # Utilities and services
│   │   ├── env.ts           # Environment validation
│   │   ├── duplicates.ts    # Duplicate detection algorithms
│   │   └── prisma.ts        # Prisma client
│   └── masking/             # Data masking functions
│       ├── functions.ts     # Masking implementations
│       └── __tests__/       # Masking tests
├── services/
│   └── ml/                  # Python ML service
│       ├── main.py          # FastAPI application
│       └── requirements.txt # Python dependencies
├── prisma/
│   └── schema.prisma        # Database schema
├── database/
│   └── migrations/          # SQL migrations
├── docs/                    # Documentation
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
├── Dockerfile               # Next.js container
└── README.md               # This file
```

## 🧪 Testing

The project uses Jest for testing with the following configuration:

- **Unit Tests**: Test individual functions and modules
- **Integration Tests**: Test API endpoints and workflows
- **Coverage Target**: 70% minimum

Run tests:
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

Coverage report will be generated in `coverage/` directory.

## 🔒 Environment Variables

Key environment variables (see `.env.example` for complete list):

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes |
| `S3_ENDPOINT` | S3/MinIO endpoint | Yes |
| `S3_ACCESS_KEY` | S3 access key | Yes |
| `S3_SECRET_KEY` | S3 secret key | Yes |
| `TYPESENSE_API_KEY` | Typesense API key | Yes |
| `ML_SERVICE_URL` | ML service URL | Yes |

**Security Note**: Always change default secrets in production!

## 🔧 Configuration

### Database

PostgreSQL with pgvector extension is required for vector similarity search.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Redis

Used for:
- Caching
- Job queue (BullMQ)
- Session storage
- Rate limiting

### Typesense

Full-text search engine for reports. Schema will be created automatically.

### MinIO (S3-compatible storage)

Used for storing:
- Evidence images
- Thumbnails
- Documents
- Exports

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/token` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/verify` - Verify API status

### Reports
- `POST /api/v1/reports` - Create report
- `GET /api/v1/reports` - List reports
- `GET /api/v1/reports/[id]` - Get report details
- `POST /api/v1/reports/[id]/comments` - Add comment

### Admin
- `POST /api/v1/admin/reports/[id]/approve` - Approve report
- `POST /api/v1/admin/reports/[id]/reject` - Reject report
- `PATCH /api/v1/admin/reports/[id]` - Edit report
- `GET /api/v1/admin/duplicates` - List duplicate clusters
- `POST /api/v1/admin/duplicates/[id]/merge` - Merge duplicates

### Search
- `GET /api/v1/search` - Search reports
- `POST /api/v1/images/search` - Reverse image search

### Images
- `POST /api/v1/images/upload/presigned` - Get presigned upload URL

Full API documentation: `/docs/USAGE_EXAMPLES.md`

## 🎯 Current Status

### ✅ Implemented (15-20%)
- Backend API (28 endpoints)
- Database schema (18+ models)
- Data masking system
- ML service (embeddings, image hashing)
- Docker infrastructure
- Testing infrastructure

### ⏳ In Progress
- Frontend UI (0%)
- Background workers (0%)
- Search indexing (0%)
- Duplicate detection worker (0%)

### 📅 Planned
- Face detection pipeline
- OCR processing
- Web crawlers & enrichment
- JavaScript SDK
- WordPress plugin
- Kubernetes deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

MIT License

## 🔗 Links

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [API Usage Examples](docs/USAGE_EXAMPLES.md)
- [Duplicate Detection System](docs/DUPLICATE_DETECTION_SYSTEM.md)
- [Testing Strategy](docs/TEST_PLAN.md)

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Note**: This project is under active development. Many features documented in `/docs` are planned but not yet implemented.
