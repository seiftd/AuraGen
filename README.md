# AuraGen AI - All-in-One Content Creation Suite

🎨 **Empowering creators with AI-powered image generation, voice synthesis, and video creation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.73-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Overview

AuraGen AI is a comprehensive mobile and web platform that enables users to create professional content using cutting-edge AI technologies. The platform offers:

- **AI Image Generation** - Transform text prompts into stunning visuals
- **Voice Synthesis** - Convert text to lifelike speech in multiple languages
- **Video Creation** - Merge images and audio into polished videos
- **Social Features** - Share, discover, and collaborate with the community
- **Multi-language Support** - Full Arabic and English localization with RTL support
- **Subscription Management** - Flexible pricing tiers with fair usage limits

## 🏗️ Architecture

This monorepo contains four main packages:

```
auragen-ai/
├── packages/
│   ├── shared/          # Common types, utilities, and constants
│   ├── backend/         # Node.js/Express API server
│   ├── mobile/          # React Native mobile app (iOS/Android)
│   └── admin-dashboard/ # React web admin panel
├── docs/               # Documentation
└── scripts/           # Build and deployment scripts
```

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 with CloudFront CDN
- **Queue System**: Bull with Redis
- **Real-time**: Socket.io
- **AI Services**: OpenAI, Stability AI, ElevenLabs, Google Cloud

#### Mobile App
- **Framework**: React Native with Expo
- **UI Library**: NativeBase with custom theming
- **Navigation**: Expo Router
- **State Management**: React Query + Context API
- **Internationalization**: react-i18next with RTL support
- **Storage**: MMKV for performance
- **Media Handling**: Expo AV, Camera, Image Picker

#### Admin Dashboard
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design Pro
- **Charts**: Ant Design Charts + Recharts
- **State Management**: React Query
- **Routing**: React Router v6

#### Shared Package
- **Validation**: Zod schemas
- **Types**: Comprehensive TypeScript definitions
- **Constants**: Centralized configuration
- **Utilities**: Reusable helper functions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB 6+
- Redis 6+
- Expo CLI (for mobile development)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/auragen-ai.git
cd auragen-ai
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
```bash
# Backend
cp packages/backend/.env.example packages/backend/.env

# Edit the .env file with your configuration
# - Database URLs
# - JWT secrets
# - AWS credentials
# - AI service API keys
# - Email configuration
```

4. **Start development servers**
```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:backend    # API server on :3001
npm run dev:admin      # Admin dashboard on :3000
npm run dev:mobile     # Mobile app with Expo
```

### Development Workflow

```bash
# Install dependencies for all packages
npm run install:all

# Run tests
npm run test

# Build all packages
npm run build

# Lint and fix code
npm run lint:fix
```

## 📱 Mobile App Features

### Core Functionality
- **User Authentication** - Secure login/register with email verification
- **Image Generation** - AI-powered image creation with style controls
- **Voice Synthesis** - Text-to-speech with emotion and voice selection
- **Video Creation** - Timeline-based editor with effects and transitions
- **Media Library** - Organized storage with search and filtering
- **Social Feed** - Discover and interact with community content

### User Experience
- **Multilingual Interface** - English and Arabic with RTL support
- **Dark/Light Themes** - Adaptive design with user preferences
- **Offline Capabilities** - Local storage and sync when online
- **Push Notifications** - Content ready alerts and system updates
- **Accessibility** - Screen reader support and high contrast modes

### Technical Features
- **Real-time Updates** - Live processing status via WebSocket
- **Background Processing** - Queue-based content generation
- **Caching Strategy** - Optimized loading with smart prefetching
- **Error Handling** - Graceful degradation and retry mechanisms

## 🌐 Admin Dashboard Features

### User Management
- **User Overview** - Comprehensive user analytics and management
- **Subscription Control** - Manage tiers, billing, and usage limits
- **Support Tools** - User assistance and account recovery
- **Moderation** - Content review and community guidelines enforcement

### Content Management
- **Content Library** - Browse all generated content with filters
- **Quality Control** - Review and moderate user-generated content
- **Template Management** - Curate featured templates and styles
- **Analytics Dashboard** - Usage statistics and performance metrics

### System Administration
- **API Monitoring** - Real-time service health and performance
- **Configuration** - System settings and feature flags
- **Billing Integration** - Payment processing and subscription management
- **Security Center** - Access logs and security monitoring

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Application
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/auragen-ai
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# AWS Services
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=auragen-ai-storage

# AI Services
OPENAI_API_KEY=your-openai-key
STABILITY_AI_API_KEY=your-stability-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# Payment
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Database Setup

```bash
# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:6

# Start Redis
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Run database migrations
npm run migrate --workspace=packages/backend

# Seed initial data (optional)
npm run seed --workspace=packages/backend
```

## 📊 API Documentation

The API follows RESTful conventions with comprehensive OpenAPI documentation available at:
- Development: `http://localhost:3001/api-docs`
- Production: `https://api.auragen.ai/docs`

### Key Endpoints

#### Authentication
```
POST /api/v1/auth/register    # User registration
POST /api/v1/auth/login       # User login
POST /api/v1/auth/refresh     # Token refresh
POST /api/v1/auth/logout      # User logout
```

#### Content Generation
```
POST /api/v1/content/images/generate    # Generate image
POST /api/v1/content/voices/generate    # Synthesize voice
POST /api/v1/content/videos/create      # Create video
GET  /api/v1/content/images             # Get user images
```

#### User Management
```
GET  /api/v1/users/profile              # Get user profile
PUT  /api/v1/users/profile              # Update profile
GET  /api/v1/users/credits              # Get credit balance
POST /api/v1/users/credits/purchase     # Purchase credits
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=packages/backend
npm run test --workspace=packages/mobile

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Structure

```
packages/
├── backend/
│   ├── __tests__/
│   │   ├── unit/          # Unit tests
│   │   ├── integration/   # Integration tests
│   │   └── e2e/          # End-to-end tests
├── mobile/
│   ├── __tests__/
│   └── components/
│       └── __tests__/     # Component tests
└── shared/
    └── __tests__/         # Utility tests
```

## 🚢 Deployment

### Production Build

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=packages/backend
npm run build --workspace=packages/admin-dashboard
```

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start production services
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Cloud Deployment

The application is designed to run on modern cloud platforms:

- **Backend**: AWS ECS, Google Cloud Run, or similar container services
- **Database**: MongoDB Atlas or AWS DocumentDB
- **Storage**: AWS S3 with CloudFront CDN
- **Mobile**: App Store and Google Play Store via EAS Build
- **Admin**: Static hosting on Vercel, Netlify, or AWS S3

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Guidelines

1. **Code Style**: Follow TypeScript and ESLint configurations
2. **Commits**: Use conventional commit messages
3. **Testing**: Ensure all tests pass and add tests for new features
4. **Documentation**: Update documentation for any API changes

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm run test`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.auragen.ai](https://docs.auragen.ai)
- **Issues**: [GitHub Issues](https://github.com/your-org/auragen-ai/issues)
- **Discord**: [Community Server](https://discord.gg/auragen-ai)
- **Email**: support@auragen.ai

## 🗺️ Roadmap

### Phase 1 - MVP (Current)
- [x] Core platform architecture
- [x] User authentication and management
- [x] Basic AI integrations
- [ ] Mobile app MVP
- [ ] Admin dashboard MVP

### Phase 2 - Enhanced Features
- [ ] Advanced video editing capabilities
- [ ] Social features and community
- [ ] Multi-language voice synthesis
- [ ] Template marketplace
- [ ] Collaboration tools

### Phase 3 - Scale & Optimize
- [ ] Performance optimizations
- [ ] Advanced analytics
- [ ] Enterprise features
- [ ] API for third-party integrations
- [ ] White-label solutions

---

**Built with ❤️ by the AuraGen AI Team**