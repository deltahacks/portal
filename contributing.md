# Contributing to DeltaHacks Portal

Welcome to the DeltaHacks Portal project! This document will help you get started and guide you through contributing to our project as a DeltaHacks technical team member.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Code Style](#code-style)
- [Database Changes](#database-changes)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Getting Help](#getting-help)

## Getting Started

As a new DeltaHacks technical team member working on this project, here's what you need to do:

1. **Clone the repository** to your local machine
2. **Set up your development environment** (see the setup guide below)
3. **Create a feature branch** for your work
4. **Make your changes** following our guidelines
5. **Submit a pull request** when you're ready

## Development Setup

### Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (package manager - we use pnpm for this project)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deltahacks/portal.git
   cd portal
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables in `.env.local`. See the [Environment Variables](#environment-variables) section for details.

4. **Set up the database:**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

The application should now be running at `http://localhost:3000`.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="your_database_url_here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"

# OAuth Providers (configure as needed)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="your_aws_region"
AWS_S3_BUCKET="your_s3_bucket_name"

# SendGrid (for emails)
SENDGRID_API_KEY="your_sendgrid_api_key"

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key"
POSTHOG_API_KEY="your_posthog_api_key"
```

## Project Structure

```
src/
├── app/                 # Next.js app directory (API routes)
├── components/          # Reusable React components
├── data/               # Static data and constants
├── env/                # Environment variable schemas
├── pages/              # Next.js pages (legacy structure)
├── schemas/            # Zod schemas for validation
├── server/             # tRPC server-side code
│   ├── router/         # tRPC routers
│   └── common/         # Shared server utilities
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Development Guidelines

### Technology Stack

This project uses the **T3 Stack**:
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **tRPC** - End-to-end typesafe APIs
- **NextAuth.js** - Authentication
- **TailwindCSS** - Styling

### Code Organization

1. **Components**: Place reusable components in `src/components/`
2. **Pages**: Use the app directory for new pages, legacy pages are in `src/pages/`
3. **API Routes**: Place API routes in `src/app/api/`
4. **Database**: Use Prisma for all database operations
5. **Validation**: Use Zod schemas for input validation

### Best Practices

1. **Type Safety**: Always use TypeScript and avoid `any` types
2. **Error Handling**: Implement proper error handling and user feedback
3. **Accessibility**: Follow WCAG guidelines and use semantic HTML
4. **Performance**: Optimize for performance and consider bundle size
5. **Security**: Validate all inputs and follow security best practices

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper type annotations
- Avoid type assertions unless absolutely necessary

### React

- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Implement proper error boundaries

### Styling

- Use TailwindCSS for styling
- Follow the existing design system
- Use CSS custom properties for theming
- Ensure responsive design

### File Naming

- Use PascalCase for components: `MyComponent.tsx`
- Use camelCase for utilities: `myUtility.ts`
- Use kebab-case for pages: `my-page.tsx`

## Database Changes

### Schema Changes

1. **Create a migration:**
   ```bash
   pnpm prisma migrate dev --name your_migration_name
   ```

2. **Update the schema** in `prisma/schema.prisma`

3. **Generate the client:**
   ```bash
   pnpm prisma generate
   ```

4. **Test your changes** thoroughly

### Database Guidelines

- Always create migrations for schema changes
- Test migrations on a copy of production data
- Document breaking changes
- Use proper relationships and constraints

## Pull Request Process

### Before Submitting

1. **Ensure your code follows our guidelines**
2. **Test your changes thoroughly**
3. **Update documentation if needed**

### Pull Request Guidelines

1. **Use descriptive titles** and descriptions
2. **Reference related issues** using keywords
3. **Include screenshots** for UI changes
4. **Describe the changes** and their impact
5. **Request reviews** from appropriate team members

### Review Process

1. **Code review** by at least one maintainer
2. **Address feedback** and make requested changes
3. **Ensure CI/CD passes**
4. **Get approval** before merging

### Commit Messages

Use [conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add or update tests
chore: maintenance tasks
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Environment details** (browser, OS, etc.)
5. **Screenshots or videos** if applicable

### Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** and benefits
3. **Implementation suggestions** if any
4. **Priority level**

## Getting Help

### Contact

- **Discord**: Ask for help in the `#technical-chat` channel in our Discord server
- **GitHub**: Comment on pull requests or issues

### Technical VP Support Policy

**Important**: Coming to the technical VPs without having already put in the effort to resolve an issue is not allowed. This follows the [Slack Engineering intern pattern](https://slack.engineering/blocked-how-to-ask-for-help-as-an-intern/) where you must demonstrate your problem-solving process before seeking help.

The key question to ask yourself is: **"Will I learn anything from spending more time on this?"**

**Types of problems you should ask for help with immediately:**
- Formatting and syntax issues
- Which function to call for specific data
- Knowledge-based questions with straightforward answers

**Types of problems you should spend time understanding first:**
- How a function actually works internally
- How state changes flow through the application
- Understanding-based questions that require deeper comprehension

**Before approaching technical VPs, you must:**

1. **Attempt to solve the problem yourself** - Research, debug, and try different approaches
2. **Create a pull request** - Show your attempted solution, even if it doesn't work
3. **Document your process** - Explain what you tried, why it didn't work, and what you learned
4. **Come prepared** - Bring specific questions about what you've already attempted

**When you do reach out, include:**
- What problem you're trying to solve
- What approaches you've already tried
- Why those approaches didn't work
- What you've learned from the process
- Specific questions about where you're stuck

**How to ask for help effectively:**
- Ask straightforward questions that are easy to answer
- Provide as much context as possible
- Describe expected vs. actual behavior
- Consider pair programming for complex problems

This approach ensures that:
- You develop strong problem-solving skills
- Technical VPs can provide more targeted, valuable assistance
- The team learns from your debugging process
- We maintain a culture of self-reliance and continuous learning

**Remember**: The goal isn't to solve the problem for you, but to guide you through the process of solving it yourself.

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma db push   # Push schema to database
pnpm prisma studio    # Open Prisma Studio
```

Welcome to the team! We're excited to have you working on the DeltaHacks Portal project! 🚀
