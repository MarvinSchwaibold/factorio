# Factorio — System Overview

An interactive workflow visualization prototype built with Next.js. It simulates an AI "Sidekick Agent" that executes multi-step Shopify merchant tasks — processing orders, analyzing sales, managing inventory, crafting emails — with real-time animated state transitions, human-in-the-loop approval gates, and branching sub-workflows.

## What It Does

A dark, retro-terminal canvas shows a central **Sidekick Agent** node with two workflow branches extending left and right. Users trigger scenarios from a sidebar, and tasks stream outward from the agent along animated SVG connection lines. Tasks progress through states autonomously, but some pause for human decisions:

- **Approval gates** — "Send 2,847 emails?" Approve or reject.
- **Resolve gates** — "12 items below stock threshold." Opens a sub-workflow (inventory reorder, email copy editor, insights review) that must complete before the main workflow continues.

Random outcomes add realism: ~10% of long tasks fail and auto-recover, ~45% trigger a rewrite cycle. Energy dots pulse along connection paths. Everything collapses with staggered blur animations when complete.

## Architecture

```
app/page.tsx              — Home component: canvas, pan/zoom, deep clean, auto-pilot, all JSX
lib/types.ts              — TaskState, Task, SubWorkflowTask, Scenario, WorkflowState
lib/theme.ts              — Retro terminal theme object + ThemeContext
lib/constants.ts          — Layout constants, scenario definitions, sub-workflow configs
hooks/useWorkflow.ts      — State machine hook: task scheduling, approval/resolve handlers
components/workflow/      — 10 extracted UI components (barrel-exported via index.ts)
components/AgentationWrapper.tsx — Wrapper for agentation library integration
```

### Key Files

**`hooks/useWorkflow.ts`** — The brain. A custom hook that encapsulates the entire workflow state machine for one side (left or right). Manages task spawning with staggered delays, random failure/rewrite outcomes, sub-workflow lifecycle, and completion collapsing. Returns `[state, setState, handlers]`.

**`app/page.tsx`** — The body. Renders two workflow instances (`useWorkflow("left")`, `useWorkflow("right")`), the infinite pan/zoom canvas, the agent container with server rack decorations, SVG connection lines with animated energy dots, and three coordination effects:
- **Auto-pilot** — automatically approves/resolves gates after a delay
- **Auto-collapse** — detects when all tasks complete and triggers the collapse animation
- **Deep clean** — spawns rapid-fire maintenance tasks on both sides simultaneously

**`lib/constants.ts`** — Scenario data. Four scenarios define the task sequences:
| Scenario | Side | Tasks | Gates |
|----------|------|-------|-------|
| Send Email Campaign | right | 11 | Email copy resolve, audience approval, send approval |
| Analyze Sales Data | left | 5 | Insights resolve |
| Check Inventory | right | 4 | Inventory resolve, reorder approval |
| Product Catalog | left | 8 | Descriptions resolve, pricing approval |

## Components

| Component | Purpose |
|-----------|---------|
| `TaskWidget` | Main task card — renders all 8 states with status indicators, subtexts, and approve/reject/resolve buttons |
| `WorkflowBranchContainer` | Wrapper with retro corner accents, scenario label header, collapse animations |
| `SubWorkflowPanel` | Branching sub-task list with SVG connection lines to parent task |
| `EmailPreviewPanel` | Editable email draft with subject/body fields and approve button |
| `InsightsPreviewPanel` | Read-only metrics dashboard (Revenue +23%, Orders +18%, etc.) |
| `CompletedTaskWidget` | Success state with checkmark and reset button |
| `LiveStatusWidget` | Fixed-position HUD showing active/completed/total task counts |
| `EnergyDot` | Animated dot traveling along SVG paths via CSS `offset-path` |
| `StatusRow` | Single status line with optional pulse animation |
| `ServerRack` | Decorative rack unit in the agent container grid |

## Task State Machine

```
idle → working → completed
                → failed → fixing → completed
                → rewriting → working → completed
     → needs_approval → (approve) → working → completed
                      → (reject)  → removed
     → needs_resolve  → (resolve) → sub-workflow → completed
```

## Canvas System

The canvas uses a zero-size anchor point at viewport center with manual `transform: translate() scale()` applied directly to the DOM for smooth pan/zoom. Mouse wheel zooms toward cursor position. State syncs to React on a 150ms debounce to avoid re-renders during interaction. A blueprint canvas mode shows all component states side-by-side for design review.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** with TypeScript
- **Framer Motion** — all animations (task entry/exit, collapse, energy dots, status pulses)
- **Tailwind CSS 4** — utility classes for layout
- **Inline styles** — all theming and component-specific styling (retro terminal aesthetic)

## Running

```bash
npm install
npm run dev     # Development server
npm run build   # Production build
npm run deploy  # Build + deploy to quick.shopify.io
```
