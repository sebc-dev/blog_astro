# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual (English/French) blog built with Astro 5.9+ and TypeScript. The project uses a modern web development stack focused on static site generation with internationalization support.

## Core Architecture

### Framework Stack

- **Astro 5.9+**: Static site generator with SSR capabilities
- **TypeScript**: Strict mode configuration with Astro integration
- **Tailwind CSS 4.1+**: Utility-first CSS framework with Vite plugin
- **DaisyUI 5.0+**: Component library built on Tailwind

### Project Structure

```
src/
├── components/           # Reusable Astro components
│   ├── ArticleCard.astro # Compact article display for grids
│   ├── ArticleHero.astro # Featured article with large display
│   ├── LatestArticlesSection.astro # Main articles section with responsive grid
│   └── header/          # Header components and utilities
├── content/
│   └── blog/            # MDX blog posts organized by language
│       ├── en/          # English articles
│       └── fr/          # French articles
├── i18n/               # Internationalization utilities
│   ├── ui.ts           # Translation dictionaries
│   └── utils.ts        # i18n helper functions
├── layouts/            # Page layouts
├── pages/              # File-based routing
│   ├── index.astro     # English homepage (no prefix)
│   └── fr/             # French pages (with /fr prefix)
└── scripts/            # Utility scripts
```

### Internationalization (i18n)

- **Default locale**: English (no URL prefix)
- **Secondary locale**: French (with /fr prefix)
- **Translation system**: Centralized in `src/i18n/ui.ts`
- **Content organization**: Language-specific folders in `src/content/blog/`

## Development Commands

### Essential Commands

```bash
# Development
pnpm dev                 # Start dev server at localhost:4321
pnpm build              # Build for production
pnpm preview            # Preview production build

# Code Quality
pnpm lint               # Run ESLint with auto-fix
pnpm lint:check         # Check linting without fixes
pnpm format             # Format code with Prettier
pnpm format:check       # Check formatting without changes

# Testing
pnpm test               # Run unit tests with Vitest
pnpm test:watch         # Run tests in watch mode
pnpm test:ui            # Open Vitest UI interface
pnpm test:coverage      # Generate coverage report
pnpm test:e2e           # Run Cypress E2E tests
pnpm test:e2e:open      # Open Cypress interface
```

### Single Test Execution

```bash
# Run specific test file
pnpm test src/test/components/ArticleCard.test.ts

# Run tests matching pattern
pnpm test --run integration

# Debug specific test with UI
pnpm test:ui src/test/integration/latest-articles-logic.test.ts
```

## Testing Architecture

### Test Structure

- **Unit tests**: `src/test/components/` for component testing
- **Integration tests**: `src/test/integration/` for feature validation
- **Test setup**: `src/test/setup.ts` with jsdom configuration
- **Mocks**: `src/test/mocks/` and `src/test/__mocks__/`

### Vitest Configuration

- **Environment**: JSDOM for DOM simulation
- **Coverage**: V8 provider with 80% thresholds
- **Setup**: Global test environment with @testing-library/jest-dom
- **Astro Integration**: Uses `getViteConfig` from astro/config

### Testing Patterns

- **Astro Components**: Limited testing due to Container API instability
- **Business Logic**: Full testing of utilities and helper functions
- **Integration**: Tests for article filtering, sorting, and i18n logic
- **Coverage**: Excludes test files, mocks, and generated content

## Key Components

### LatestArticlesSection.astro

Main component that displays featured articles with:

- Automatic content fetching via `getCollection("blog")`
- Language-based filtering using `getLangFromUrl()`
- Hero article (newest) + grid layout for remaining articles
- Responsive design: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Auto-categorization and tagging based on content keywords
- Reading time calculation (200 words/minute for French content)

### Article Components

- **ArticleHero.astro**: Large featured article display with full metadata
- **ArticleCard.astro**: Compact card for grid display with truncated content

### Content Management

- **Auto-categorization**: Framework, Language, Performance, Styling, Backend
- **Auto-tagging**: Guide, Optimization, Best Practices, Comparison
- **Metadata**: Automatic reading time, date formatting, author info

## Configuration Files

### astro.config.mjs

- **Output**: Static site generation
- **i18n**: EN default (no prefix), FR with /fr prefix
- **Integrations**: MDX with Shiki syntax highlighting, Sitemap
- **Vite**: Tailwind plugin integration

### vitest.config.ts

- **Environment**: JSDOM with setup file
- **Coverage**: V8 provider with HTML/JSON/LCOV reporters
- **Thresholds**: 80% for branches, functions, lines, statements
- **Timeout**: 5s dev, 10s CI

### Key Cursor Rules

From `.cursor/rules/`:

- **Focus System**: IMPLEMENTATION vs DEBUGGING modes
- **Testing**: Vitest best practices with mock patterns
- **Architecture**: TypeScript strict mode with Astro integration
- **Stack**: Modern web development with performance focus

## Development Guidelines

### Code Quality

- **TypeScript**: Strict mode enabled, full type safety required
- **ESLint**: Astro-specific rules with accessibility checks
- **Prettier**: Consistent formatting with Astro plugin
- **No comments**: Code should be self-documenting unless specifically requested

### Testing Requirements

- **Always run**: `pnpm lint` and `pnpm test` before committing
- **Coverage**: Maintain 80% minimum coverage thresholds
- **Integration**: Test real content and i18n functionality
- **E2E**: Cypress available for critical user flows

### Performance Considerations

- **Build-time processing**: Content aggregation and filtering at build time
- **Image optimization**: Use Astro's built-in image optimization when possible
- **CSS**: Critical CSS inlined, non-critical CSS loaded asynchronously
- **i18n**: Static generation for all language variants

### Content Guidelines

- **Bilingual**: All UI text must have English and French translations
- **MDX**: Blog posts use MDX format with frontmatter metadata
- **SEO**: Proper meta descriptions and structured data
- **Accessibility**: ARIA labels, alt text, keyboard navigation support
