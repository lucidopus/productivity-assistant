# Productivity Assistant

A comprehensive personal AI assistant application designed to help users optimize their productivity through intelligent planning, proactive communication, and deep contextual understanding. The system combines a web dashboard with a Slack bot for seamless daily interaction and accountability.

## 🎯 Project Vision

This productivity assistant acts as a dedicated personal coach that knows you deeply and helps bridge the gap between your goals and daily execution. It provides:

- **Proactive Weekly Planning**: Initiates Sunday evening planning sessions
- **Daily Task Generation**: Creates detailed daily plans based on weekly goals
- **Adaptive Scheduling**: Adjusts plans based on real progress and changing priorities
- **Contextual Memory**: Maintains comprehensive understanding of your preferences, patterns, and commitments
- **Slack Integration**: Natural conversations through your existing workflow

## 🏗️ Architecture

This is a monorepo with a workspace-based architecture:

```
productivity-assistant/
├── frontend/          # Next.js 15 web application
├── trigger/           # Trigger.dev v4 background jobs
├── docs/             # Technical architecture and planning
├── tasks/            # Project management and task tracking
├── package.json      # Root workspace configuration
└── trigger.config.ts # Trigger.dev configuration
```

### Technology Stack

**Frontend (`frontend/`)**
- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS 4.x with custom design system
- **State Management**: Zustand with persistence for user profiles and onboarding
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Lucide React icons and Framer Motion
- **Authentication**: JWT-based authentication with bcrypt password hashing

**Backend & Infrastructure**
- **Runtime**: Node.js with TypeScript
- **Database**: MongoDB for user profiles, plans, and conversation history
- **Background Jobs**: Trigger.dev v4 for scheduled planning and check-ins
- **API**: Next.js API routes with comprehensive error handling
- **Deployment**: Vercel-ready with environment-specific configurations

**Key Dependencies**
- `zustand` - Lightweight state management with persistence
- `zod` - Runtime type validation and schema definition
- `framer-motion` - Smooth animations and transitions
- `@trigger.dev/sdk` - Background job processing
- `mongodb` - Database connectivity and operations
- `jose` & `jsonwebtoken` - JWT token handling

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or later
- MongoDB instance (local or Atlas)
- Trigger.dev account for background jobs

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd productivity-assistant
   npm run install-all
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Configure environment variables in .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Web dashboard: [http://localhost:3000](http://localhost:3000)
   - API endpoints: [http://localhost:3000/api](http://localhost:3000/api)

## 📋 Available Scripts

### Root Workspace Commands
```bash
npm run dev          # Start frontend development server
npm run build        # Build all workspaces
npm run start        # Start production frontend
npm run lint         # Lint all workspaces
npm run clean        # Clean all build artifacts and dependencies
npm run install-all  # Install dependencies across all workspaces
```

### Frontend-Specific Commands
```bash
cd frontend/
npm run dev         # Next.js development server
npm run build       # Production build
npm run start       # Production server
npm run lint        # ESLint checking
npm run clean       # Clean build artifacts
```

## 🔧 Development Workflow

### Key Development Guidelines

1. **Read Documentation First**: Always check README files in each directory
2. **UI Development**: Refer to `docs/dev_rules/ui_rules.md` before building components
3. **State Management**: Use Zustand patterns established in `frontend/src/stores/`
4. **Type Safety**: Maintain TypeScript strict mode throughout
5. **Validation**: Use Zod schemas for all data validation

### Project Structure Deep Dive

**Frontend Architecture (`frontend/src/`)**
```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable UI components
├── contexts/         # React contexts for global state
├── lib/             # Utility functions and configurations
├── stores/          # Zustand state management stores
├── types/           # TypeScript type definitions
└── middleware.ts    # Next.js middleware for auth and routing
```

**Key Files and Patterns**
- **State Management**: `frontend/src/stores/onboarding.ts` - Zustand with persistence
- **User Profile Model**: Comprehensive data collection through detailed onboarding
- **Type Definitions**: Pydantic-style Field descriptions in TypeScript interfaces
- **Trigger.dev Config**: `trigger.config.ts` with project ID `proj_vssuekxwuhnjfzqgpaxd`

## 🎨 Current Implementation Status

The application is currently in the **onboarding and user profile phase** with:

### ✅ Completed Features
- **Authentication System**: JWT-based auth with bcrypt password hashing
- **User Profile Management**: Comprehensive data collection system
- **Onboarding Flow**: Multi-step process with state persistence
- **UI Foundation**: Tailwind CSS design system with responsive components
- **State Management**: Zustand stores with local storage persistence
- **Type Safety**: Full TypeScript integration with Zod validation

### 🚧 In Development
- **Slack Bot Integration**: Proactive conversation system
- **Planning Engine**: Weekly and daily plan generation
- **Background Jobs**: Trigger.dev scheduled tasks for check-ins
- **MongoDB Integration**: User data persistence and conversation history

### 📋 Upcoming Features
- **AI Conversation Engine**: Natural language processing for planning discussions
- **Adaptive Scheduling**: Learning from user patterns and adjusting plans
- **Analytics Dashboard**: Progress tracking and productivity insights
- **Mobile Optimization**: Enhanced mobile experience

## 🔐 Security & Data Protection

- **Authentication**: Secure JWT implementation with proper token lifecycle
- **Password Security**: bcrypt hashing with appropriate salt rounds
- **Data Validation**: Runtime validation with Zod schemas
- **Environment Security**: Sensitive data properly isolated in environment variables
- **Type Safety**: Comprehensive TypeScript coverage preventing runtime errors

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)**: Detailed system design and implementation
- **[Project Plan](docs/PROJECT_PLAN.md)**: Original vision and requirements
- **[Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)**: Development phases and milestones
- **[Development Rules](docs/dev_rules/)**: UI guidelines and development standards

## 🔄 Background Jobs (Trigger.dev)

The application uses Trigger.dev v4 for scheduled background tasks:

- **Project ID**: `proj_vssuekxwuhnjfzqgpaxd`
- **Configuration**: `trigger.config.ts`
- **Jobs Directory**: `trigger/` (planned implementation)
- **Scheduling**: Weekly planning (Sundays) and daily check-ins (weekday evenings)

## 🤝 Contributing

This is a personal productivity assistant, but the architecture and patterns can serve as a reference for similar applications. Key development principles:

1. **Type Safety First**: Maintain strict TypeScript throughout
2. **User Experience Focus**: Prioritize smooth, intuitive interactions
3. **Persistent State**: Ensure user data and context are never lost
4. **Proactive Design**: Build features that anticipate user needs
5. **Comprehensive Testing**: Maintain test coverage for critical paths

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Resources

- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Trigger.dev Documentation**: [https://trigger.dev/docs](https://trigger.dev/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Zustand State Management**: [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
