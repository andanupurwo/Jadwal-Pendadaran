# Project Structure Guide - Jadwal Pendadaran

## Overview

This project follows **international software development standards** for organization and structure. The reorganization ensures:

✅ **Scalability** - Easy to add new features  
✅ **Maintainability** - Clear file organization  
✅ **Testability** - Isolated test directories  
✅ **Professionalism** - Industry-standard layout  

---

## Directory Structure

### Root Level

```
jadwal_pendadaran/
├── .github/              # GitHub-specific files
├── .editorconfig         # Editor configuration (tabs, spaces, etc.)
├── .env.example          # Example environment variables
├── .eslintrc.json        # ESLint rules
├── .gitignore
├── .prettierrc            # Prettier formatting rules
├── CHANGELOG.md          # Version history
├── CONTRIBUTING.md       # Contribution guidelines
├── README.md             # Main project documentation
├── QUICKSTART.md         # Quick setup guide
├── PROJECT_SUMMARY.md    # Project overview
├── STRUCTURE_REORGANIZATION_PLAN.md
├── package.json          # Root dependencies (optional, for monorepo)
├── package-lock.json
│
├── backend/              # Backend API
├── frontend/             # Frontend UI
├── database/             # Database files
├── docs/                 # All documentation
├── scripts/              # Deployment & setup scripts
└── tools/                # Development tools (future)
```

### Backend Structure

```
backend/
├── src/                  # SOURCE CODE
│   ├── config/           # Configuration (database, env)
│   ├── controllers/      # Business logic
│   ├── middleware/       # Express middleware
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── routes/           # API endpoints
│   ├── utils/            # Helper functions
│   │   └── logger.js
│   ├── database/         # Database layer
│   │   ├── init.js
│   │   ├── migrations/   # Migration files
│   │   └── seeds/        # Seed data
│   └── server.js         # Entry point
│
├── tests/                # TESTS & FIXTURES
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── fixtures/         # Test data
│   │   └── PAS 10 HARI ILKOM.csv
│   ├── test_compareNames.js
│   ├── check_dosen_limit.js
│   ├── check_dummy.js
│   ├── check_stats.js
│   ├── cleanup_dummy.js
│   ├── test_mahasiswa.csv
│   └── check_novita.cjs
│
├── scripts/              # UTILITY SCRIPTS
│   ├── add_race_condition_fix.mjs
│   ├── run_migration.js
│   ├── run_migration.mjs
│   ├── verify_schema.mjs
│   └── migrate.js
│
├── logs/                 # Runtime logs
│   ├── info.log
│   └── warn.log
│
├── .env                  # Environment variables
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── node_modules/
```

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/           # Images, icons, etc.
│   │   └── data/
│   ├── components/       # UI Components
│   │   └── ui/           # Modal, toast, etc.
│   ├── pages/            # Page components
│   ├── services/         # API calls
│   ├── styles/           # CSS files
│   ├── utils/            # Helper functions
│   ├── data/             # Initial data
│   ├── config/           # Constants
│   ├── logic/            # Business logic
│   ├── handlers/         # Event handlers
│   ├── core/             # Core utilities
│   └── main.js           # Entry point
│
├── tests/                # Test files (future)
│   ├── unit/
│   └── e2e/
│
├── public/               # Static files
├── index.html
├── .env
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
└── node_modules/
```

### Database Structure

```
database/
├── migrations/           # All migration files
│   ├── 20260201_add_nik.js
│   ├── 20260213_critical_fixes.sql
│   └── ... other migrations
├── backups/              # Database backups
│   └── backup_latest.sql
├── seeds/                # Seed data scripts
└── schema.sql            # Database schema reference
```

### Docs Structure

```
docs/
├── API.md                         # API documentation
├── ARCHITECTURE.md                # System architecture
├── AUDIT_REPORT.md                # Security audit findings
├── IMPLEMENTATION_GUIDE.md         # Implementation details
├── CRITICAL_FIXES_COMPLETE.md      # Fixes summary
├── DEVELOPMENT.md                 # Development setup (future)
├── DEPLOYMENT.md                  # Deployment guide (future)
├── REFACTORING.md
├── project-structure.txt
└── images/                        # Documentation images (future)
```

### Scripts Structure

```
scripts/
├── backup-db.bat         # Database backup script
├── backup-db.sh          # Bash version
├── restore-db.sh         # Database restore
├── setup-dev.sh          # Development environment setup
└── deploy.sh             # Production deployment
```

---

## File Organization Rules

### ✅ DO:
- Keep source code in `src/` directory
- Keep all tests in `tests/` directory
- Keep utilities in `utils/` directory
- Keep configs in `config/` directory
- Keep styles centralized in `styles/` directory
- Keep migrations in `database/migrations/`
- Document in `docs/` directory

### ❌ DON'T:
- Mix source and test files
- Put test files in root directory
- Store backups in active directories
- Mix different concerns in one folder
- Keep obsolete files (use git history instead)
- Have deeply nested folders (max 3-4 levels)

---

## Key Changes Made

### Before (Messy)
```
❌ Test files scattered everywhere
❌ Multiple docs at root level
❌ Scripts mixed with source
❌ No clear organization
```

### After (Clean)
```
✅ backend/tests/          # All tests centralized
✅ docs/                   # All documentation centralized
✅ scripts/                # All scripts organized
✅ backend/src/            # Source code clearly separated
✅ Proper folder nesting   # Industry standard
```

---

## Running Commands

### Backend

```bash
# Start development server
cd backend
npm start                    # Runs src/server.js

# Development with reload
npm run dev                  # Runs src/server.js with --watch

# Initialize database
npm run init-db              # Runs src/database/init.js

# Run tests
npm run test                 # Runs tests/test_compareNames.js

# Database migration
npm run migrate              # Runs scripts/run_migration.mjs

# Seeds/fixes
npm run seed                 # Runs scripts/add_race_condition_fix.mjs
```

### Frontend

```bash
# Start development server
cd frontend
npm run dev                  # Runs Vite dev server on port 5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Setup

### Backend (.env file)
```
DB_HOST=127.0.0.1
DB_USER=postgres
DB_PASSWORD=admin123
DB_NAME=jadwal_pendadaran
DB_PORT=5432
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=jadwal_pendadaran_dev_secret_key_2026_change_in_production_12345678
```

### Frontend (.env file)
```
VITE_API_URL=http://localhost:3000/api
```

---

## Adding New Features

### New Backend Feature

1. Create controller in `backend/src/controllers/`
2. Create routes in `backend/src/routes/`
3. Add tests in `backend/tests/`
4. Update middleware if needed in `backend/src/middleware/`
5. Add documentation in `docs/`

### New Frontend Feature

1. Create components in `frontend/src/components/`
2. Create pages in `frontend/src/pages/`
3. Create services in `frontend/src/services/`
4. Add tests in `frontend/tests/`
5. Add styles in `frontend/src/styles/`

### Database Changes

1. Create migration in `database/migrations/`
2. Follow naming: `YYYYMMDD_description.sql` or `.js`
3. Document in `docs/`
4. Test locally before committing

---

## Git Workflow

### Branch Naming
- Feature: `feature/feature-name`
- Bugfix: `bugfix/bug-name`
- Hotfix: `hotfix/critical-issue`

### Commit Messages
```
Add user authentication

- Implement JWT token generation
- Add token validation middleware
- Update user routes with auth protection

Fixes #123
```

### Before Push
```bash
# Backend
cd backend
npm run test
npm run lint

# Frontend
cd frontend
npm run lint
npm run build
```

---

## Documentation Structure

Each directory should have a `README.md`:

- `backend/README.md` - Backend setup & API docs
- `frontend/README.md` - Frontend setup & component docs
- `database/README.md` - Database schema & migrations
- `docs/README.md` - Documentation index

---

## Maintenance

### Regular Tasks
- ✅ Update CHANGELOG.md with changes
- ✅ Keep docs/ up-to-date
- ✅ Review and merge test files
- ✅ Remove obsolete scripts

### Backup
- Database backups → `database/backups/`
- Keep last 7 days of backups
- Test restore procedures monthly

---

## Future Improvements

- [ ] Add GitHub Actions CI/CD (`.github/workflows/`)
- [ ] Add Docker support (`tools/docker/`)
- [ ] Add E2E tests (`frontend/tests/e2e/`)
- [ ] Add API documentation generator
- [ ] Setup automated testing pipeline
- [ ] Add code coverage reports

---

## Questions?

Refer to:
- `README.md` - Main documentation
- `QUICKSTART.md` - Quick setup
- `CONTRIBUTING.md` - Contributing guidelines
- `docs/ARCHITECTURE.md` - System design
- `docs/API.md` - API reference

Last Updated: 13 Feb 2026
