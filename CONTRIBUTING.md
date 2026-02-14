# Contributing to Jadwal Pendadaran

We love your input! We want to make contributing to this project as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've changed code, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue a pull request

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update CHANGELOG.md with a note of your changes
3. Ensure all tests pass
4. Request review from maintainers

## Coding Standards

### JavaScript/Node.js
- Use ES6+ modules (`import`/`export`)
- Use 2-space indentation
- Use semicolons
- Use single quotes for strings
- Follow the code style defined in `.eslintrc.json`
- Format code with `.prettierrc` rules

### Git Commit Messages
- Use the imperative mood ("add feature" not "added feature")
- Use the present tense ("move cursor to..." not "moved cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Example:
  ```
  Add user authentication
  
  - Implement JWT token generation
  - Add token validation middleware
  - Update user routes with auth protection
  
  Fixes #123
  ```

### Branch Naming
- Feature: `feature/feature-name`
- Bugfix: `bugfix/bug-name`
- Hotfix: `hotfix/critical-issue`

## Project Structure

```
backend/
  src/           # Source code
  tests/         # Test files
  scripts/       # Utility scripts
frontend/
  src/           # Source code
  tests/         # Test files
docs/            # Documentation
scripts/         # Deployment & setup scripts
database/        # Database files & migrations
```

## Testing

- Backend tests: `npm run test` (from backend/)
- Frontend tests: `npm run test` (from frontend/)
- Integration tests: `npm run test:integration`

## Reporting Bugs

Use GitHub Issues with the following template:

- **Summary**: Brief description of the issue
- **Environment**: OS, Node version, browser, etc.
- **Steps to Reproduce**: How to recreate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Logs/Screenshots**: Any relevant output

## Feature Requests

Use GitHub Issues with:
- **Description**: What feature and why
- **Use Case**: How would it be used
- **Additional Context**: Any other info

## Setup Development Environment

1. Clone the repo
2. Install Node.js (v18+ recommended)
3. Install PostgreSQL (v14+)
4. Run setup script: `./scripts/setup-dev.sh`
5. Copy `.env.example` to `.env` and configure
6. Start backend: `npm start` (from backend/)
7. Start frontend: `npm run dev` (from frontend/)

## Code of Conduct

- Be respectful and inclusive
- No harassment or hate speech
- Welcome diverse perspectives
- Focus on constructive feedback

## Questions?

Feel free to open an issue with the question tag or contact the maintainers.

Thank you for contributing! 🎉
