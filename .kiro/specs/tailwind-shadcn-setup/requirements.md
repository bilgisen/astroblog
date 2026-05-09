# Requirements Document

## Introduction

This feature covers the complete, working integration of Tailwind CSS v4 and shadcn/ui into the existing Astro blog project. The project already has `@tailwindcss/vite` and `@astrojs/react` installed, but the setup is incomplete: `global.css` is missing the Tailwind import directive, `tsconfig.json` is missing the path alias required by shadcn/ui, and shadcn/ui itself has not been initialized. The goal is a fully configured environment where shadcn/ui components can be added and used inside Astro pages and layouts without breaking the existing blog styles.

## Glossary

- **Astro**: The static site framework used for this blog project.
- **Tailwind_CSS**: The utility-first CSS framework (v4) providing styling primitives.
- **shadcn_ui**: A component library that generates React components styled with Tailwind CSS and Radix UI primitives.
- **CSS_Entry_Point**: The file `src/styles/global.css`, which is imported in the base layout and serves as the single CSS entry point for the project.
- **Path_Alias**: A TypeScript/bundler shortcut (e.g., `@/`) that maps to a source directory, required by shadcn/ui's import conventions.
- **shadcn_CLI**: The `shadcn` command-line tool used to initialize the component library and add individual components.
- **components_json**: The `components.json` configuration file created by the shadcn CLI at the project root, which records the project's shadcn/ui settings.
- **UI_Directory**: The directory `src/components/ui/`, where shadcn/ui places generated component files.
- **cn_Utility**: The `cn()` helper function (from `clsx` + `tailwind-merge`) placed in `src/lib/utils.ts`, used by all shadcn/ui components to merge class names.

## Requirements

### Requirement 1: Tailwind CSS v4 Active in the Project

**User Story:** As a developer, I want Tailwind CSS utility classes to be available globally, so that I can style any Astro component or page using Tailwind without additional configuration.

#### Acceptance Criteria

1. THE `CSS_Entry_Point` SHALL contain `@import "tailwindcss"` as its first non-comment line so that Tailwind's base, components, and utilities layers are injected.
2. WHEN the development server starts, THE Astro build pipeline SHALL process `CSS_Entry_Point` through the `@tailwindcss/vite` plugin already registered in `astro.config.mjs`.
3. WHEN a Tailwind utility class (e.g., `text-red-500`) is added to any `.astro` or `.tsx` file, THE browser SHALL render the corresponding style without requiring a separate build step.

### Requirement 2: TypeScript Path Alias Configured

**User Story:** As a developer, I want a `@/` path alias pointing to `src/`, so that shadcn/ui components and my own code can import shared utilities with short, consistent paths.

#### Acceptance Criteria

1. THE `tsconfig.json` SHALL define `baseUrl` as `"."` and a `paths` entry mapping `"@/*"` to `["./src/*"]` under `compilerOptions`.
2. WHEN a TypeScript or TSX file contains `import { cn } from "@/lib/utils"`, THE TypeScript compiler SHALL resolve the import without errors.
3. THE existing `compilerOptions` entries (`strictNullChecks`, `jsx`, `jsxImportSource`) SHALL remain unchanged after the alias is added.

### Requirement 3: shadcn/ui Initialized

**User Story:** As a developer, I want shadcn/ui initialized in the project, so that I can add individual components using the shadcn CLI and have them work out of the box.

#### Acceptance Criteria

1. THE project root SHALL contain a `components.json` file produced by the shadcn CLI `init` command, configured for Tailwind CSS v4, React (JSX), the `@/` path alias, and the `src/styles/global.css` CSS entry point.
2. THE `CSS_Entry_Point` SHALL contain the shadcn/ui CSS custom-property theme variables (e.g., `--background`, `--foreground`, `--primary`) injected by the CLI under an `@layer base` block.
3. THE `UI_Directory` SHALL exist at `src/components/ui/`.
4. THE `cn_Utility` file SHALL exist at `src/lib/utils.ts` and SHALL export a `cn` function that accepts class name arguments and returns a merged class string.
5. IF the shadcn CLI `init` command exits with a non-zero status, THEN THE developer SHALL receive a descriptive error message indicating which prerequisite (Tailwind config, path alias, or CSS entry point) is missing.

### Requirement 4: shadcn/ui Component Installable and Usable

**User Story:** As a developer, I want to add a shadcn/ui component (e.g., Button) and use it in an Astro page, so that I can verify the full integration works end-to-end.

#### Acceptance Criteria

1. WHEN the command `npx shadcn@latest add button` is run, THE shadcn_CLI SHALL generate `src/components/ui/button.tsx` without errors.
2. WHEN `src/components/ui/button.tsx` is imported into an Astro page using `client:load` or `client:visible`, THE component SHALL render in the browser with its default shadcn/ui styles applied.
3. THE addition of shadcn/ui components SHALL NOT remove or override the existing blog styles defined in `CSS_Entry_Point` above the Tailwind import.
4. WHEN the project is built with `astro build`, THE build SHALL complete without TypeScript errors related to path aliases or missing shadcn/ui dependencies.

### Requirement 5: Existing Blog Styles Preserved

**User Story:** As a developer, I want the existing blog appearance to remain intact after the integration, so that adding Tailwind and shadcn/ui does not break the current design.

#### Acceptance Criteria

1. THE existing CSS custom properties and rules in `CSS_Entry_Point` (e.g., `--accent`, `--gray`, `body`, `main`, `.prose`) SHALL remain present and active after the integration.
2. WHEN Tailwind's preflight (base reset) styles conflict with existing blog styles, THE `CSS_Entry_Point` SHALL use CSS cascade layers or ordering to ensure the existing blog rules take precedence.
3. THE `Header`, `Footer`, and blog post pages SHALL render visually consistent with their pre-integration appearance when no Tailwind classes have been explicitly added to those components.
