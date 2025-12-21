# Contribution Guide

## Getting Started

### Fork & Clone
```bash
# Fork repository on GitHub
git clone https://github.com/your-username/multi-tenant-saas-platform.git
cd multi-tenant-saas-platform
```

### Setup Development Environment
```bash
# Backend
cd backend
npm install
npm run migrate
npm run seed

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Development Workflow

### Create Feature Branch
```bash
git checkout -b feature/AmazingFeature
```

### Make Changes
1. Write code following style guidelines
2. Add tests for new features
3. Update documentation
4. Test thoroughly

### Commit Changes
```bash
git add .
git commit -m "feat: add amazing feature"
```

### Push & Create PR
```bash
git push origin feature/AmazingFeature
```

Then create Pull Request on GitHub.

## Code Style Guidelines

### JavaScript/Node.js
```javascript
// Use const by default, let if reassignment needed
const config = require('./config');

// Use arrow functions for callbacks
const users = data.map(d => d.user);

// Use async/await over Promise chains
async function fetchUser(id) {
  const response = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return response.rows[0];
}

// Use meaningful variable names
const userCount = await getUserCount(); // ✓
const uc = await getUC(); // ✗
```

### React/JSX
```jsx
// Component names PascalCase
function UserCard({ user, onEdit }) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

// Use functional components
function MyComponent() {} // ✓
class MyComponent extends React.Component {} // ✗

// Props destructuring
function Card({ title, children }) {} // ✓
function Card(props) { return props.title; } // ✗
```

### CSS/Tailwind
```jsx
// Use Tailwind utility classes
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" />

// No custom CSS for simple styling
<style>
  .button { padding: 8px 16px; background: blue; }
</style>
```

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no functionality change)
- `refactor`: Code refactoring
- `test`: Test addition/change
- `chore`: Build, dependencies

### Examples
```
feat(auth): add JWT token verification
fix(tasks): fix task status update validation
docs(api): update endpoint documentation
refactor(database): optimize user queries
```

## PR Review Checklist

### Code Quality
- [ ] Follows code style guidelines
- [ ] No console.log() or debugger statements
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling
- [ ] Comments for complex logic

### Security
- [ ] No SQL injection vulnerabilities
- [ ] Proper input validation
- [ ] No XSS vulnerabilities
- [ ] Secure authentication/authorization
- [ ] Secrets in environment variables

### Testing
- [ ] New features have tests
- [ ] All tests pass
- [ ] Manual testing done
- [ ] Error cases tested
- [ ] Multi-tenancy verified (if applicable)

### Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Code comments added
- [ ] Commit messages clear

## Testing Requirements

### Backend
```bash
npm test                    # Run all tests
npm test -- --coverage     # Coverage report
```

### Frontend
```bash
npm test                    # Run all tests
npm run build              # Build for production
```

## Performance Considerations

### Backend
- Avoid N+1 queries (use JOINs)
- Add database indexes for frequent filters
- Implement pagination for large datasets
- Cache tenant configurations (if needed)

### Frontend
- Code split routes for lazy loading
- Optimize images and assets
- Use React.memo for expensive components
- Monitor bundle size

## Documentation Updates

### Files to Update
- `README.md` - Major features
- `docs/API.md` - New endpoints
- `docs/technical-spec.md` - Architecture changes
- `ARCHITECTURE_DECISIONS.md` - Design decisions

### Format
```markdown
## Section Title

Description of changes.

### Code Example
\`\`\`javascript
code example
\`\`\`
```

## Bug Reporting

### Create Issue with
- [ ] Clear title and description
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] Screenshots (if UI bug)
- [ ] Environment (Node version, OS, etc.)

### Issue Template
```markdown
## Description
Brief description of the bug.

## Steps to Reproduce
1. Do this
2. Then this
3. Bug occurs

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Node version: 18.x
- OS: Windows 10
- Browser: Chrome 120
```

## Feature Requests

### Submit with
- [ ] Clear use case
- [ ] Why it's needed
- [ ] Proposed solution (optional)
- [ ] Implementation difficulty estimate

## Getting Help

1. Check existing issues and PRs
2. Read documentation
3. Ask in discussions
4. Create new issue if needed

## Review Process

1. **Automated Checks**: Tests and linting must pass
2. **Code Review**: At least one maintainer review
3. **Testing**: Manual testing verification
4. **Approval**: Ready to merge
5. **Merge**: Squash or rebase based on commits

## Release Process

### Version Numbering
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Steps
1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Build Docker images
5. Push to registries
6. Announce release

## Code of Conduct

### Be Respectful
- Respectful communication
- No harassment or discrimination
- Inclusive language

### Be Collaborative
- Help other contributors
- Review PRs promptly
- Share knowledge

### Be Professional
- Focus on code quality
- Constructive feedback
- Acknowledge mistakes

## Questions?

Ask in:
- GitHub Issues
- Discussions
- Email
- Documentation

---

**Version**: 1.0.0  
**Last Updated**: December 2024
