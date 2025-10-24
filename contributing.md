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
- **Docker** - Required for local database setup
  - **Recommended**: [OrbStack](https://orbstack.dev/) - A fast, lightweight Docker Desktop alternative optimized for macOS
  - Alternative: Docker Desktop

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
   cp .env.example .env
   ```

   Fill in the required environment variables in `.env`. Reach out to either of the VPs to recieve the environemntal variables needed.

4. **Set up the database:**

   ```bash

   # Start the database using the provided script
   # ⚠️  WARNING: Make sure you've completed step 3 (environment variables) first!
   # The setup-db.sh script requires environment variables from .env.local to work properly.
   ./setup-db.sh

   # Generate Prisma client and push schema
   pnpm db:generate
   pnpm db:push
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

The application should now be running at `http://localhost:3000`.

### Database Setup

The project includes a `setup-db.sh` script that automatically sets up a local CockroachDB database using Docker. This script:

- Checks for Docker or Podman installation
- Creates a CockroachDB container if it doesn't exist
- Starts the database on port 26257
- Provides a web UI on port 8080

**Prerequisites:**

- **Docker** installed and running (see [Prerequisites](#prerequisites) for our recommended Docker client)
- Port 26257 available (the script will check this)

## Project Structure

```
src/
├── app/                 # Next.js app directory (API routes)
├── assets/              # Static assets (pass files, images, etc.)
├── components/          # Reusable React components
├── data/               # Static data and constants
├── env/                # Environment variable schemas
├── pages/              # Next.js pages (legacy structure)
├── schemas/            # Zod schemas for validation
├── server/             # tRPC server-side code
│   ├── router/         # tRPC routers
│   ├── common/         # Shared server utilities
│   ├── db/             # Database-related code
│   └── trpc/           # tRPC configuration
│       └── router/     # Nested tRPC router structure
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

#### State Management Best Practices

**Avoid unnecessary useState:**

- Don't use state for values that can be derived from props or other state
- Don't use state for values that don't trigger re-renders
- Don't use state for values that are only used in event handlers

**When to use useState:**

- When a value changes over time and affects the UI
- When a value needs to persist between re-renders

**Examples of unnecessary state:**

```tsx
// ❌ Bad - unnecessary state
const [fullName, setFullName] = useState(firstName + " " + lastName);

// ✅ Good - derived value
const fullName = firstName + " " + lastName;
```

```tsx
// ❌ Bad - state for event handler only
const [isSubmitting, setIsSubmitting] = useState(false);
const handleSubmit = () => {
  setIsSubmitting(true);
  // ... submit logic
};

// ✅ Good - use ref or local variable if needed
const isSubmittingRef = useRef(false);
const handleSubmit = () => {
  isSubmittingRef.current = true;
  // ... submit logic
};
```

**Caching expensive calculations:**

```tsx
// ❌ Bad - recalculating on every render
const expensiveValue = expensiveCalculation(data);

// ✅ Good - memoized calculation
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

**Avoiding unnecessary Effects:**

```tsx
// ❌ Bad - Effect for derived state
const [filteredTodos, setFilteredTodos] = useState([]);
useEffect(() => {
  setFilteredTodos(todos.filter((todo) => !todo.completed));
}, [todos]);

// ✅ Good - calculate during render
const filteredTodos = todos.filter((todo) => !todo.completed);
```

**Common patterns to avoid:**

- Storing computed values in state
- Using state for form values that don't need validation
- Storing UI state that can be derived from props
- Using state for values that are only used in callbacks
- Using Effects to transform data for rendering
- Using Effects to handle user events (use event handlers instead)

**Key principles:**

- If you can calculate something during render, you don't need an Effect
- To cache expensive calculations, use `useMemo` instead of `useEffect`
- Code that runs because a component was displayed should be in Effects
- Code that runs because a user did something should be in event handlers

For more detailed guidance on avoiding unnecessary Effects and state, see the [React documentation on "You Might Not Need an Effect"](https://react.dev/learn/you-might-not-need-an-effect).

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

5. **Deploy the migration to your db**
   ```bash
   pnpm db:push
   ```

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
4. Run `pnpm format`

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
pnpm dev              # Start development server (includes pnpm i && prisma generate)
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Database
pnpm db:generate      # Generate Prisma client and run migrations
pnpm db:migrate       # Deploy migrations to production
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Prisma Studio
```

Welcome to the team! We're excited to have you working on the DeltaHacks Portal project! 🚀
