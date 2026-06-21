# Itch — Visual RL Environment Builder

Build reinforcement learning training environments without writing code. Drag blocks onto a canvas, connect them together, and export a structured JSON spec your training backend can consume.

**Live demo:** https://build-khaki-iota.vercel.app

---

## What it does

Itch gives you a Scratch-style block editor for describing RL environments. Instead of hand-authoring JSON or Python config, you visually assemble:

- **What world your agent lives in** — the Environment block sets the scene
- **What tools your agent can use** — Tool blocks define callable actions with typed inputs
- **What your agent should practice** — Task blocks specify prompts and graders
- **How tasks are grouped** — TaskSet blocks bundle related tasks into a curriculum
- **What data your agent can access** — Database blocks declare retrieval sources

When you're done, hit **Compile** and the workspace serializes to a structured JSON payload ready for your training backend.

---

## Block types

| Block | Purpose |
|---|---|
| `Environment` | Defines the world context — description, constraints, overall goal |
| `Tool` | A callable function the agent can invoke, with named typed inputs |
| `Task` | A single training prompt with one or more graders (answer-check or state-check) |
| `Task Set` | A C-block that groups tasks into a named curriculum |
| `Database` | A named retrieval source the agent can query |

---

## Getting started

```bash
git clone <repo>
cd build
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Building for production

```bash
npm run build
```

Output goes to `dist/`. Deploy anywhere that serves static files — the app is fully browser-side, no server required.

---

## Stack

- **React 19** + TypeScript
- **Vite 8** for bundling
- **Tailwind v4** (CSS-only `@theme inline`, no config file)
- **shadcn/ui** for base primitives
- **Lucide React** for icons
- **Montserrat Variable** font via `@fontsource-variable/montserrat`

No backend is required to run the UI. The `/api/compile` endpoint is called when you hit Compile — point it at your own server or leave it disconnected to use the builder purely as a design tool.

---

## Project structure

```
src/
├── pages/
│   ├── DashboardPage.tsx       # environment list + templates
│   └── BuilderPage.tsx         # the canvas editor
├── components/
│   ├── WorkspaceTab.tsx         # pan/zoom canvas, drag/snap logic
│   ├── WorkspaceBlock.tsx       # individual block shell + SVG connectors
│   ├── TaskSetBlock.tsx         # C-block for grouping tasks
│   ├── BlocksTab.tsx            # block palette (left sidebar)
│   ├── CompletenessChecker.tsx  # live validation overlay
│   ├── TutorialOverlay.tsx      # first-time onboarding modal
│   └── BlockFields/             # field editors per block type
│       ├── EnvFields.tsx
│       ├── ToolFields.tsx
│       ├── TaskFields.tsx
│       └── DatabaseFields.tsx
└── lib/
    ├── types.ts                 # block discriminated union + type guards
    ├── serialize.ts             # Block[] → WorkspaceJSON
    ├── api.ts                   # POST /api/compile
    ├── storage.ts               # localStorage CRUD for saved environments
    ├── templates.ts             # built-in starter templates
    └── blockColors.ts           # per-block-type color palette
```

---

## How blocks connect

Blocks stack vertically via a peg-and-socket system (SVG trapezoid shapes, similar to Scratch). Drag a block near the bottom of another — when the snap indicator glows, release to connect. Connected blocks move as a chain.

The `Environment` block can only appear once per workspace. All other block types are unlimited.

Canvas controls:
- **Scroll** to zoom
- **Drag the background** to pan
- **Drag a block's grip handle** to move it (and anything connected below it)

---

## Serialization format

The Compile button POSTs this shape to `/api/compile`:

```json
{
  "version": 1,
  "blocks": [
    { "type": "env", "description": "A customer support agent for a SaaS product" },
    {
      "type": "tool",
      "name": "lookup_ticket",
      "functionality": "Retrieves a support ticket by ID",
      "inputs": [{ "name": "ticket_id", "type": "string", "description": "The ticket ID", "required": true }]
    },
    {
      "type": "taskset",
      "name": "Tier 1 Issues",
      "tasks": [
        {
          "type": "task",
          "prompt": "The customer says their account is locked. Help them.",
          "graders": [{ "graderType": "answer", "weight": 1, "condition": "mentions account recovery" }]
        }
      ]
    }
  ]
}
```

---

## Deployments

| Branch | URL | Notes |
|---|---|---|
| `main` | https://build-khaki-iota.vercel.app | Stable |
| `ui-experiments` | https://build-jji9dpvsz-saketh-s-projects2.vercel.app | Active UI work |

---

## Templates

Three built-in templates to get started:

- **Inventory Agent** — tool use + database retrieval for warehouse management
- **Support Agent** — multi-turn task sets with answer graders
- **Research Agent** — web search tools + state-based graders
