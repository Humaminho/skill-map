# SkillMap

A local developer dashboard for visualizing and managing agent skills stored at `~/.agents/skills/`. Built with Next.js, TypeScript, shadcn/ui, and Tailwind CSS.

## Features

- **Skills Grid** — Browse all installed agent skills with search and category filtering
- **Skill Detail Modal** — View full SKILL.md content, trigger conditions, and file trees
- **Dependency Graph** — Interactive React Flow visualization of cross-references between skills
- **File Inspector** — Syntax-highlighted file viewer with theme-aware highlighting (light/dark)
- **Trigger Inspector** — Visual breakdown of when-to-use and when-not-to-use conditions
- **Quick Copy** — One-click copy for folder paths and ready-to-use reference snippets
- **Dark Mode** — System-aware theme toggle with full dark mode support

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) package manager
- Agent skills installed at `~/.agents/skills/` (each skill is a directory containing a `SKILL.md` file)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
app/
  layout.tsx          # Root layout with fonts, theme provider
  page.tsx            # Home page — skills grid
  graph/page.tsx      # Dependency graph page
  api/skills/         # API routes for skill data
components/
  site-header.tsx     # Shared header (search, filters, navigation)
  site-footer.tsx     # Shared footer
  skills-explorer.tsx # Main grid orchestrator
  skill-card.tsx      # Individual skill card
  skill-detail-modal.tsx  # Detail modal with tabs
  skill-graph-view.tsx    # React Flow dependency graph
  skill-markdown.tsx      # Markdown renderer with syntax highlighting
  trigger-inspector.tsx   # Trigger condition visualizer
  file-viewer.tsx         # Theme-aware file viewer
  skill-file-tree.tsx     # Recursive file tree
  theme-toggle.tsx        # Dark mode toggle
  graph-page.tsx          # Graph page client wrapper
lib/
  skills.ts           # Server-side skills parser
  graph.ts            # Dagre graph layout builder
  types.ts            # Shared TypeScript types
  utils.ts            # Utility functions
```

## Tech Stack

- [Next.js 16](https://nextjs.org/) with Turbopack
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Radix Mira style)
- [React Flow](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre) for graph layout
- [Shiki](https://shiki.style/) for syntax highlighting
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for YAML frontmatter parsing
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Production build         |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

## License

MIT

## Author

Built by [Humaminho](https://github.com/Humaminho)
