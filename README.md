# Zionixweb 1.0

A modern web application for cryptocurrency trading and management.

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

```bash
pnpm install
```

### Running the Development Server

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

### Linting and Type Checking

The project uses ESLint for code linting and TypeScript for type checking. To run these checks:

```bash
# Run ESLint
pnpm lint

# Run ESLint with auto-fix
pnpm lint:fix

# Run TypeScript type checking
pnpm type-check
```

### ESLint Configuration

The project uses a custom ESLint configuration with the following key features:

- Strict TypeScript checks
- React best practices
- Next.js recommended rules
- Auto-fix capabilities for common issues

Common linting issues and how to fix them:

1. **Unused Variables**: Remove unused variables or prefix them with `_` if they're required but unused.
2. **Any Types**: Replace `any` types with proper TypeScript types or interfaces.
3. **React Hooks Dependencies**: Make sure to include all dependencies in the dependency array of useEffect and other hooks.
4. **Image Elements**: Use `next/image` instead of `<img>` tags for better performance.

### Environment Variables

Make sure to set up the following environment variables in your `.env` file:

```env
NEXT_PUBLIC_SOLANA_RPC=
NEXT_PUBLIC_JUPITER_API_KEY=
NEXT_PUBLIC_SOLSCAN_API_TOKEN=
NEXT_PUBLIC_FEE_WALLET=
```

## License

This project is proprietary and confidential. All rights reserved. 