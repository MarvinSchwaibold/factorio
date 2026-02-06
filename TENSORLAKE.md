# Tensorlake — Reference Notes

Source: [tensorlake.ai](https://tensorlake.ai/)

Tensorlake bills itself as **"The Engine for Agentic Work"** — serverless infrastructure for deploying production AI agents with durable execution, document ingestion, and multi-cloud support.

---

## What's Relevant to Factorio

### Shared Concept: Agent Workflow Orchestration
Both Factorio and Tensorlake model the same fundamental idea — an agent dispatching multi-step tasks that progress through states, branch into sub-workflows, and require coordination. Tensorlake does it for real; Factorio visualizes what it *feels like*.

| | Tensorlake (Production) | Factorio (Visualization) |
|---|---|---|
| Tasks | Python functions with `@function()` decorators | Scenario step definitions with labels/durations |
| Branching | Map-reduce primitives, functional composition | Sub-workflow panels (inventory, email, insights) |
| Failure handling | Automatic durability, crash recovery, resume | Random 10% fail → auto-fix animation cycle |
| Human-in-the-loop | Not shown (likely API-driven) | Approval/resolve gates with approve/reject buttons |
| State visibility | Metrics dashboard (sessions, latency, uptime) | LiveStatusWidget + per-task status indicators |
| Compute | GPU attachment (`gpu="A10"`), sandboxed execution | Decorative server rack grid around agent node |

### Hero Metrics Pattern
Tensorlake's hero leads with live-feeling stats: **180 active sessions**, **90ms dispatch latency**, **500M+ documents parsed**. Factorio's `LiveStatusWidget` does the same thing — showing active tasks, completed counts, and session stats. The pattern works because it immediately communicates *aliveness* rather than explaining features.

### Durable Execution = Factorio's Fail/Fix Cycle
Tensorlake's core pitch is that agents can crash and resume without losing progress. Factorio already visualizes this concept — tasks randomly fail, show a red "failed" state, transition to blue "fixing", and auto-recover to green "completed". This is the animated version of durable execution.

### Document Processing Pipeline → Task Sequences
Tensorlake shows: input (30+ formats) → layout parsing → OCR/VLM → structured extraction → visual citations. This is structurally identical to Factorio's scenario sequences: trigger → working tasks → resolve gate → sub-workflow → approval → completion.

---

## Design Language Comparison

### Where They Diverge
Tensorlake uses a **clean, modern SaaS aesthetic** — white/light backgrounds, green accent (#0AA67D), minimal UI, smooth scrolling animations. Factorio uses a **retro terminal aesthetic** — dark background (#0d0f0d), monospace type, teal accent (#5eead4), sharp corners, CRT-style glows.

### What Tensorlake Does Well
- **Grid backgrounds** as subtle texture (18px linear-gradient patterns) — Factorio does this too (20px grid)
- **Continuous scroll animations** for logos/content — smooth, low-effort way to show activity
- **Feature tabs** that switch between capability views with max-height transitions
- **Metric cards** with large numbers and small labels — high information density
- **Green-on-dark** for status/success states — both use similar green tones for "completed"

### Animation Patterns Worth Noting
| Pattern | Tensorlake | Factorio Equivalent |
|---------|-----------|-------------------|
| Horizontal scroll loop | Logo carousel (20s linear infinite) | Energy dots along SVG paths |
| Vertical content loop | 12s document processing cycle | Task list growing/collapsing |
| Grid background | 18px CSS linear-gradient | 20px CSS linear-gradient |
| Hover pause | `animation-play-state: paused` | Not used (could add to energy dots) |
| Max-height expand | Feature tab content reveal | Sub-workflow panel entry |

---

## Ideas to Pull From

1. **Metric formatting** — Tensorlake formats numbers boldly: `<100ms`, `10,000+`, `90,000 REQ/SEC`. Factorio's LiveStatusWidget could adopt this typographic treatment for task counts.

2. **Pipeline stage labels** — Tensorlake labels processing stages clearly: "Layout Parsing → OCR + VLM → Structured Extraction". Factorio's scenarios could show a pipeline progress indicator above the task list.

3. **Uptime/status indicator** — A simple green dot + "Operational" text in Tensorlake's hero. The agent node in Factorio could show a persistent status badge.

4. **Framework badges** — Tensorlake shows "Works with Langchain, Pydantic, etc." as small logos. The agent container could show integration badges for the tools it's orchestrating.

5. **Continuous scroll as ambient motion** — Tensorlake uses horizontal scroll loops as background texture. Factorio could add a subtle data-stream scroll inside the server rack cells when workflows are active.

---

## Key Takeaway

Tensorlake solves the *infrastructure* problem of running agents in production. Factorio solves the *perception* problem — making the invisible orchestration visible and tangible. They're two sides of the same coin. The visual language of Factorio (branching workflows, state transitions, energy flow, human gates) is essentially a design system for how agent orchestration *should look* to end users, regardless of what engine runs underneath.
