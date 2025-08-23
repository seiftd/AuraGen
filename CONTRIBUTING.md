# Contributing to AuraGen AI

🎉 Thank you for your interest in contributing to AuraGen AI! We welcome contributions from everyone, whether you're fixing a bug, improving documentation, or proposing new features.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@auragen.ai](mailto:conduct@auragen.ai).

## 🚀 Getting Started

### Types of Contributions

We welcome many types of contributions, including:

- **Bug fixes** - Help us squash those pesky bugs
- **Feature development** - Implement new functionality
- **Documentation** - Improve our docs and guides
- **Testing** - Add test coverage and improve reliability
- **UI/UX improvements** - Make the app more beautiful and usable
- **Performance optimizations** - Make things faster and more efficient
- **Translations** - Help us support more languages
- **Code reviews** - Review pull requests from other contributors

### Before You Start

1. **Check existing issues** - Look through our [issue tracker](https://github.com/your-org/auragen-ai/issues) to see if someone else has already reported the bug or requested the feature.

2. **Create an issue** - If you're planning a significant change, please create an issue first to discuss your approach with the maintainers.

3. **Fork the repository** - Create your own fork to work on.

## 💻 Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB 6+
- Redis 6+
- Git
- Docker (optional, for containerized development)

### Local Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/auragen-ai.git
cd auragen-ai
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
```bash
cp packages/backend/.env.example packages/backend/.env
# Edit the .env file with your configuration
```

4. **Start the development environment**
```bash
# Option 1: Start all services
npm run dev

# Option 2: Start services individually
npm run dev:backend
npm run dev:admin
npm run dev:mobile
```

5. **Run tests to ensure everything works**
```bash
npm run test
```

### Docker Setup (Alternative)

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🛠️ Contributing Guidelines

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test improvements
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

Examples:
```
feature/ai-image-generation
fix/user-authentication-bug
docs/api-documentation-update
test/add-unit-tests-for-auth
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

Examples:
```
feat(auth): add social login with Google OAuth
fix(mobile): resolve crash on image upload
docs(api): update authentication endpoints
test(backend): add integration tests for user service
```

### Issue Templates

When creating issues, please use our templates:

- **Bug Report** - For reporting bugs
- **Feature Request** - For requesting new features
- **Documentation** - For documentation improvements
- **Performance** - For performance-related issues

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork**
```bash
git checkout main
git pull upstream main
git checkout your-feature-branch
git rebase main
```

2. **Run tests and linting**
```bash
npm run test
npm run lint
npm run type-check
```

3. **Build the project**
```bash
npm run build
```

### Submitting Your Pull Request

1. **Create a clear title and description**
   - Use a descriptive title
   - Reference related issues with `Fixes #123` or `Closes #456`
   - Explain what you changed and why
   - Include screenshots for UI changes

2. **Fill out the PR template** - Provide all requested information

3. **Request review** - Tag relevant maintainers or team members

4. **Be responsive** - Address feedback promptly and professionally

### PR Review Process

1. **Automated checks** - All CI checks must pass
2. **Code review** - At least one maintainer approval required
3. **Testing** - Manual testing for significant changes
4. **Documentation** - Ensure docs are updated if needed
5. **Merge** - Maintainer will merge when approved

## 💡 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use enums for constants with multiple values
- Add JSDoc comments for public APIs

```typescript
/**
 * Creates a new user account
 * @param userData - User registration data
 * @returns Promise resolving to created user
 */
export async function createUser(userData: CreateUserRequest): Promise<User> {
  // Implementation
}
```

### React/React Native

- Use functional components with hooks
- Prefer custom hooks for reusable logic
- Use TypeScript for prop types
- Follow component naming conventions

```typescript
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  // Component implementation
};
```

### Backend (Node.js)

- Use async/await over promises
- Implement proper error handling
- Use middleware for cross-cutting concerns
- Follow RESTful API conventions

```typescript
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await userService.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
```

### Database

- Use Mongoose for MongoDB operations
- Implement proper indexes
- Use transactions for multi-document operations
- Follow schema naming conventions

### CSS/Styling

- Use consistent naming conventions
- Prefer CSS-in-JS or styled-components
- Follow responsive design principles
- Use design tokens for consistency

## 🧪 Testing Guidelines

### Test Structure

```
packages/
├── backend/
│   ├── __tests__/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
├── mobile/
│   ├── __tests__/
│   └── components/
│       └── __tests__/
└── shared/
    └── __tests__/
```

### Writing Tests

- **Unit tests** - Test individual functions/components
- **Integration tests** - Test component interactions
- **E2E tests** - Test complete user workflows

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      const user = await userService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Focus on critical paths and edge cases
- Mock external dependencies
- Use realistic test data

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Include examples in documentation
- Keep comments up-to-date with code changes
- Document complex business logic

### README Updates

- Update feature lists for new functionality
- Add new environment variables to setup instructions
- Update API documentation links
- Include migration guides for breaking changes

### API Documentation

- Use OpenAPI/Swagger specifications
- Include request/response examples
- Document error codes and messages
- Provide authentication examples

## 🌍 Community

### Getting Help

- **Discord** - Join our [community server](https://discord.gg/auragen-ai)
- **GitHub Discussions** - Ask questions and share ideas
- **Issues** - Report bugs and request features
- **Email** - Contact us at [developers@auragen.ai](mailto:developers@auragen.ai)

### Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Hall of Fame page
- Special Discord roles

## 🏆 Contribution Levels

### First-time Contributors

Perfect first contributions:
- Fix typos in documentation
- Add missing translations
- Write tests for existing code
- Improve error messages
- Add code comments

### Regular Contributors

- Implement new features
- Fix complex bugs
- Improve performance
- Review other contributors' PRs
- Help with issue triage

### Core Contributors

- Architectural decisions
- Major feature planning
- Release management
- Mentoring new contributors
- Community building

## 📝 License

By contributing to AuraGen AI, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

**Questions?** Feel free to reach out to us at [developers@auragen.ai](mailto:developers@auragen.ai) or join our [Discord community](https://discord.gg/auragen-ai).

Thank you for helping make AuraGen AI better! 🚀