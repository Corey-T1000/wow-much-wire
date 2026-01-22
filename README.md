# Wow Much Wire

Interactive wiring diagram tool for automotive projects. Built for documenting complex rewiring projects like full vehicle harness builds.

![Wiring Diagram](https://img.shields.io/badge/Status-Active%20Development-green)

## Features

- **Interactive Diagrams** - Drag-and-drop components, zoom, pan, and explore complex wiring layouts
- **Circuit Filtering** - Isolate specific circuits (lighting, engine, fuel, etc.) to reduce visual clutter
- **Pin-level Detail** - View connector pinouts with wire gauges, fuse ratings, and functions
- **Version History** - Save snapshots and restore previous versions
- **AI Wiring Assistant** - Chat with an AI that understands automotive electrical systems
- **Print/Export** - Generate printable pinout sheets and poster-size diagrams
- **Shareable Links** - Share read-only views of your diagrams

## Current Project: 1993 NA Miata Full Rewire

This instance is configured for a complete rewire of a 1993 Mazda Miata (NA) including:
- Bussmann PDM power distribution
- MS3Pro Mini ECU integration
- Simplified lighting circuits
- Fuel and cooling system wiring

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Diagram Engine**: React Flow
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenRouter (optional, for wiring assistant)
- **Auth**: Better Auth with Google OAuth
- **Styling**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)
- pnpm

### Local Development

```bash
# Clone the repo
git clone https://github.com/Corey-T1000/wow-much-wire.git
cd wow-much-wire

# Install dependencies
pnpm install

# Copy environment template
cp env.example .env
# Edit .env with your values

# Start the database
docker compose up -d

# Push database schema
pnpm db:push

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the diagram.

### Environment Variables

See `env.example` for all available options. Required for basic functionality:

- `POSTGRES_URL` - Database connection string
- `BETTER_AUTH_SECRET` - Auth session secret (generate with `openssl rand -base64 32`)

Optional:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `OPENROUTER_API_KEY` - For AI wiring assistant chat

## Usage

### Navigating the Diagram

- **Pan**: Click and drag on empty space
- **Zoom**: Scroll wheel or pinch
- **Select Component**: Click on any component to see details
- **Filter Circuits**: Use the circuit tabs to isolate specific systems

### Keyboard Shortcuts

- `Cmd/Ctrl + K` - Open search
- `Cmd/Ctrl + S` - Save current state

## Contributing

This is a personal project but PRs are welcome for bug fixes and improvements.

## License

MIT

---

Built with the [Agentic Coding Starter Kit](https://github.com/leonvanzyl/agentic-coding-starter-kit)
