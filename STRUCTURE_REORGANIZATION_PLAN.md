# Project Structure Reorganization Plan

## Current Issues Found

### Root Directory (Messy)
```
❌ Test files scattered: check_dosen_limit.js, check_dummy.js, test_mahasiswa.csv
❌ Installation scripts: install_cekin.sh, install_cekot.sh
❌ Backup files: backup_db.bat
❌ Multiple doc files: README.md, QUICKSTART.md, PROJECT_SUMMARY.md, AUDIT_REPORT.md, IMPLEMENTATION_GUIDE.md, CRITICAL_FIXES_COMPLETE.md
❌ No clear package.json (only in subdirs)
```

### Backend Directory (Disorganized)
```
❌ Test files mixed with source:
   - check_dosen_limit.js
   - check_dummy.js
   - check_novita.cjs
   - check_stats.js
   - cleanup_dummy.js
   - test_compareNames.js

❌ Migration scripts scattered:
   - add_race_condition_fix.mjs
   - run_migration.js
   - run_migration.mjs
   - migrate.js
   - verify_schema.mjs

❌ Logs folder should be in separate location
```

## Target Structure (International Standard)

```
jadwal_pendadaran/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline
│
├── backend/
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utilities
│   │   ├── database/
│   │   │   ├── migrations/     # DB migration files
│   │   │   ├── seeds/          # DB seed data
│   │   │   └── init.js
│   │   └── server.js           # Main entry point
│   │
│   ├── tests/                  # All test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/           # Test data
│   │
│   ├── scripts/                # Utility scripts
│   │   ├── check-dosen-limit.js
│   │   ├── check-stats.js
│   │   └── cleanup-dummy.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── data/
│   │   ├── config/
│   │   ├── logic/
│   │   ├── handlers/
│   │   ├── ui/
│   │   └── main.js
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── e2e/
│   │
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── AUDIT_REPORT.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── CRITICAL_FIXES_COMPLETE.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   └── project-structure.txt
│
├── database/
│   ├── backups/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   ├── setup-dev.sh
│   └── deploy.sh
│
├── .github/
│   ├── workflows/
│   │   └── ci-cd.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── tools/
│   ├── dev-setup.js
│   └── docker/
│       └── Dockerfile (future)
│
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .eslintrc.json
├── docker-compose.yml (optional)
├── package.json (root/monorepo)
├── package-lock.json
├── README.md (main)
├── QUICKSTART.md
├── PROJECT_SUMMARY.md
└── CHANGELOG.md
```

## Key Changes

### 1. Root Level Cleanup
- Keep only: `.gitignore`, `.editorconfig`, `.prettierrc`, docs, package.json, README.md
- Move test files → `backend/tests/` and `frontend/tests/`
- Move scripts → `scripts/` and `backend/scripts/`
- Move all docs → `docs/`

### 2. Backend Reorganization
- Add `src/` wrapper for all source code
- Create `tests/` folder for all test files
- Create `scripts/` for utility scripts
- Move database stuff to root `database/` folder

### 3. Database Cleanup
- Move all migration scripts → `database/migrations/`
- Move backup files → `database/backups/`
- Consolidate all .sql files

### 4. Documentation Centralization
- All .md files → `docs/`
- Keep only main README.md and QUICKSTART.md at root

### 5. Git/CI-CD Setup
- Create `.github/workflows/` for CI/CD
- Setup issue templates
- Add `.editorconfig` & `.prettierrc`

## Files to Move

### Root to /docs:
- AUDIT_REPORT.md
- IMPLEMENTATION_GUIDE.md
- CRITICAL_FIXES_COMPLETE.md
- API.md (from docs/)
- ARCHITECTURE.md (from docs/)
- REFACTORING.md (from docs/)

### Root to /backend/tests:
- test_mahasiswa.csv

### Root to /backend/scripts:
- check_dosen_limit.js
- check_dummy.js

### Backend to /backend/scripts:
- check_dosen_limit.js
- check_dummy.js
- check_novita.cjs ❌ (delete - obsolete)
- check_stats.js
- cleanup_dummy.js

### Backend to /database/migrations:
- add_race_condition_fix.mjs
- run_migration.js
- run_migration.mjs
- migrate.js
- verify_schema.mjs

### Backend source to /backend/src:
- config/
- controllers/
- database/
- middleware/
- routes/
- utils/
- server.js

### Root scripts to /scripts:
- backup_db.bat → backup-db.sh
- install_cekin.sh → setup-dev.sh
- install_cekot.sh → delete (duplicate?)

## Files to Delete/Cleanup
- ❌ check_novita.cjs (obsolete test)
- ❌ install_cekot.sh (duplicate?)
- ❌ Merge similar .md files (no duplicates needed)

## New Files to Create
- ✅ .editorconfig
- ✅ .prettierrc
- ✅ .eslintrc.json (optional)
- ✅ CHANGELOG.md
- ✅ CONTRIBUTING.md (optional)
- ✅ `/database/schema.sql` (reference)
- ✅ `/database/backups/` folder
