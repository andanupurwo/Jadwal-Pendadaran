# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Token expiry checking on frontend
- Rate limiting middleware (100 req/15min)
- Input validation for all API endpoints
- Request logging with timestamps and IP tracking
- Database-level constraints for race condition prevention
- N+1 query optimization in slot loading

### Changed
- Reorganized project structure to follow international standards
- Moved all test files to `backend/tests/` directory
- Moved all scripts to `scripts/` and `backend/scripts/` directories
- Centralized documentation in `docs/` directory
- Backend source code now in `backend/src/`

### Fixed
- Race condition protecting dosen quota
- N+1 query performance issue (10x faster)
- JWT secret not properly configured
- Token expiry error messages
- Missing input validation on login endpoints

### Security
- Added UNIQUE constraints in database tables
- Implemented JWT token expiry checking
- Added rate limiting to prevent brute force attacks
- Standardized error response messages
- Implemented proper validation middleware

## [1.0.0] - 2026-02-13

### Added
- Initial project setup
- Database schema with PostgreSQL
- JWT authentication system
- Schedule generation algorithm
- Dosen (lecturer) quota management
- Name matching with fuzzy logic
- CORS configuration
- Logging system

### Features
- REST API for scheduling
- Mahasiswa (student) management
- Dosen management
- Libur (holiday) management
- Slots management
- Schedule generation with algorithm constraints
- Reports and statistics
- Admin dashboard

## Previous Versions

See git history for detailed changes.
