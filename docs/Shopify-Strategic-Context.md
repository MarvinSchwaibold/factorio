# Shopify Strategic Context: 2026 Reference Document

> A comprehensive reference on Shopify's strategic priorities, product hierarchy, agentic commerce strategy, Commerce OS architecture, and AI vision. Compiled from internal Vault data for feeding context to a Claude instance that will rethink the Shopify Admin from first principles.

---

## Table of Contents

1. [Active Missions](#active-missions)
2. [Product Hierarchy](#product-hierarchy)
3. [Agentic Commerce Strategy](#agentic-commerce-strategy)
4. [Commerce OS Vision](#commerce-os-vision)
5. [AI Strategy](#ai-strategy)
6. [Admin-Specific Missions and Projects](#admin-specific-missions-and-projects)
7. [Key Strategic Themes](#key-strategic-themes)
8. [How the Admin Fits Into the Broader Platform](#how-the-admin-fits-into-the-broader-platform)

---

## Active Missions

Missions are Shopify's highest priority strategic goals -- company-wide efforts aimed by a leader selected by Tobi, time-bound with a definition of done. They represent where Shopify is putting intentional energy and focus.

### Full Mission List

| Priority | Mission | Aimer | Active Projects | Vault Link |
|----------|---------|-------|-----------------|------------|
| **P0** | World-class product search | Mikhail Parakhin | 20 | [Link](https://vault.shopify.io/gsd/missions/8512-World-class-product-search) |
| **P0** | Launch and scale Shopify Markets (Product) | David Moellenkamp | 18 | [Link](https://vault.shopify.io/gsd/missions/8513-Launch-and-scale-Shopify-Markets-Product) |
| **P0** | Inventory Ledger Foundations | Mani Fazeli | 20 | [Link](https://vault.shopify.io/gsd/missions/8515-Inventory-Ledger-Foundations) |
| **P0** | Agentic Storefronts | Vanessa Lee | 21 | [Link](https://vault.shopify.io/gsd/missions/8590-Agentic-Storefronts) |
| **P0** | Money Infrastructure | Rohit Mishra | 11 | [Link](https://vault.shopify.io/gsd/missions/8643-Money-Infrastructure) |
| **P1** | Low latency storefronts everywhere | Manuel Darveau | 6 | [Link](https://vault.shopify.io/gsd/missions/8519-Low-latency-storefronts-everywhere) |
| **P1** | Accelerate Shop App daily active user growth | Archie Abrams | 34 | [Link](https://vault.shopify.io/gsd/missions/8525-Accelerate-Shop-App-daily-active-user-growth) |
| **P1** | Win Retail | Ray Reddy | 61 | [Link](https://vault.shopify.io/gsd/missions/8528-Win-Retail) |
| **P1** | Shopify, Help me Sell | Archie Abrams | 18 | [Link](https://vault.shopify.io/gsd/missions/8532-Shopify-Help-me-Sell) |
| **P1** | The best AI recommendations tools in commerce | Mikhail Parakhin | 49 | [Link](https://vault.shopify.io/gsd/missions/8534-The-best-AI-recommendations-tools-in-commerce) |
| **P1** | Build Shopify Ads Engine | Masha Savitskaia | 25 | [Link](https://vault.shopify.io/gsd/missions/8541-Build-Shopify-Ads-Engine) |
| **P1** | Shopify has 1 checkout engine | Mani Fazeli | 8 | [Link](https://vault.shopify.io/gsd/missions/8573-Shopify-has-1-checkout-engine) |
| **P1** | Yugabyte | Kir Shatrov | 42 | [Link](https://vault.shopify.io/gsd/missions/8642-Yugabyte) |
| **P2** | Predictable orders delivery | Vibhor Chhabra | 15 | [Link](https://vault.shopify.io/gsd/missions/8530-Predictable-orders-delivery) |
| **P2** | Merchant-driven optimizations | Mani Fazeli | 8 | [Link](https://vault.shopify.io/gsd/missions/8538-Merchant-driven-optimizations) |
| -- | Global Product Catalog | Mikhail Parakhin | 9 | [Link](https://vault.shopify.io/gsd/missions/7963-Global-Product-Catalog) |
| -- | Reportify | Nicolas Grasset | 14 | [Link](https://vault.shopify.io/gsd/missions/8539-Reportify) |
| -- | **Make admin AI native** | Vanessa Lee | 26 | [Link](https://vault.shopify.io/gsd/missions/8540-Make-admin-AI-native) |

### Mission Hierarchy Summary

**Infrastructure layer (P0):**
- Inventory Ledger Foundations, Money Infrastructure, World-class product search -- foundational commerce primitives
- Agentic Storefronts -- the single most important initiative at the company for 2026

**Commerce expansion (P0-P1):**
- Shopify Markets -- international commerce capabilities
- Win Retail (61 projects!) -- largest mission by project count
- 1 checkout engine -- unifying online and retail checkout

**Growth and discovery (P1):**
- Shop App DAU growth, AI recommendations, Ads Engine, "Help me Sell"
- These form the buyer-side and marketing-side growth engines

**Platform modernization (P1-P2):**
- Yugabyte (database migration), low latency storefronts, merchant-driven optimizations
- Reportify -- analytics infrastructure

**AI and Admin (unprioritized but critical):**
- Make admin AI native -- 26 active projects, aimed by Vanessa Lee
- Global Product Catalog -- feeds into agentic commerce

---

## Product Hierarchy

### Top-Level Product Tree

```
Shopify (root)
|
+-- Checkout
|   +-- Cart
|   +-- Checkout Page
|   +-- Customer Accounts
|   +-- Draft Orders
|   +-- Gift Cards
|   +-- Payment Methods
|   +-- Shop Pay
|   +-- Shopify Payments
|   +-- Store Credit
|   +-- Wallets
|
+-- Shopify Admin  <-- (Vanessa Lee overall, Lawrence Mandel technical)
|   +-- Home
|   +-- Products
|   +-- Collections
|   +-- Bundles
|   +-- Inventory
|   +-- Orders (+ Exchanges, Refunds, Returns)
|   +-- Customers
|   +-- B2B
|   +-- Discounts
|   +-- Markets (+ Managed Markets)
|   +-- Fulfillment (+ SFN, Shop Promise)
|   +-- Finance (Balance, BillPay, Capital, Credit, Tax)
|   +-- Flow (automations)
|   +-- Sidekick (AI assistant)
|   +-- Shopify Growth Ads (+ Sell for Me, Campaigns, Product Network)
|   +-- Analytics / Reportify / ShopifyQL
|   +-- Admin API (+ App Extensions, Polaris, Shopify Functions)
|   +-- Shopify Mobile App
|   +-- Metafields / Metaobjects
|   +-- Domains, Files, Signup, Subscriptions, Plans & Trials
|   +-- Shopify Customer Events
|
+-- Storefronts
|   +-- Liquid Storefronts (1P Themes, Online Store Editor, Theme Store)
|   +-- Hydrogen (headless React framework)
|   +-- Oxygen (hosting)
|   +-- Storefront API
|   +-- Storefront Search
|
+-- Shop (buyer-facing)
|   +-- Shop App
|   +-- Shop Minis
|   +-- Shop Package Tracking
|   +-- Shop Web
|
+-- Shopify Apps (1P + 3P)
|   +-- Marketplace Connect
|   +-- Shop Campaigns
|   +-- Shopify Audiences
|   +-- Shopify Collabs
|   +-- Shopify Collective
|   +-- Shopify Forms
|   +-- Shopify Inbox
|   +-- Shopify Messaging
|
+-- Shopify Ecosystem
|   +-- App Store
|   +-- Channel Apps
|   +-- Developer Platform
|   +-- Partners Dashboard
|   +-- Shopify CLI, Dev Docs, Functions
|
+-- Shopify Retail
|   +-- POS App, POS Channel, POS Checkout, POS Hardware
|
+-- Platform Infrastructure
|   +-- Catalogue (product understanding for search and AI)
|   +-- Data Storage, Real-time Storage
|   +-- Search Platform
|   +-- Identity (KYB/KYC, Shop Sign In, Trust Battery, Trust Platform)
|   +-- Observability, Networking, Platform Security
|   +-- Webhooks, Experiments Platform, Shopify Data Platform
|   +-- Imagery
|
+-- Shopify Corp (internal)
|   +-- Billing, Revenue Tools, Support Tools
|   +-- Vault, Talent Systems, Melody, Mozart
|   +-- Salesforce, Performance Marketing
|
+-- Shopify.com (marketing site)
|   +-- Brochure, Editions, BFCM Globe
|
+-- Internal Dev Tools
|   +-- CI/CD Pipeline, Monorepo, Ruby Language, Ruby on Rails, Testing Tools
|
+-- Help Center
```

### Key Aimers (Leadership)

| Person | Products Aimed |
|--------|---------------|
| **Vanessa Lee** | Shopify Admin (overall), Storefronts, Sidekick, Shopify Apps, Catalogue, Agentic Storefronts mission |
| **Lawrence Mandel** | Admin API, Flow, Metafields/Metaobjects, Shopify Mobile App, Webhooks, Shopify Ecosystem (technical) |
| **Mani Fazeli** | Checkout, Products, Orders, Inventory, Discounts, Markets, Bundles, Collections, Subscriptions |
| **Manuel Darveau** | Low latency storefronts, Checkout (technical), Channel Apps, Imagery |
| **Archie Abrams** | Shop App, Plans & Trials, Signup, Help Center, "Help me Sell" mission |
| **Mikhail Parakhin** | World-class product search, AI recommendations, Global Product Catalog |
| **Rohit Mishra** | Money Infrastructure, Managed Markets, Shop Pay, Shopify Payments, Gift Cards |
| **Eytan Seidman** | Shopify Ecosystem (overall), Admin API, Flow, Metafields/Metaobjects |
| **Ray Reddy** | Shopify Retail (overall), Win Retail mission |

---

## Agentic Commerce Strategy

### The Big Picture

Shopify is positioning itself as the foundational infrastructure for AI-powered commerce. Tobi has predicted **up to 50% of all GMV could eventually flow through agent commerce**. UCP (Universal Commerce Protocol) is described internally as "literally the most important project at the company right now" (Jan 2026 Eng+Data Live).

> "If we miss this moment, it would be disastrous for the company, but we'll not miss this one." -- Mikhail Parakhin

### Universal Commerce Protocol (UCP)

**What it is:** An open standard co-developed by Shopify and Google (built in 88 days) that enables AI agents to transact with merchants. It is the protocol layer that standardizes how agents discover products, manage carts, and complete transactions.

**Key facts:**
- Announced at NRF January 2026, generating 250+ media stories and 260+ prospect meetings
- Co-developed with Google; Google AI Mode is the first major launch partner
- Major retailers including Walmart, Target, Etsy, and Wayfair have already adopted UCP
- Publicly available at [ucp.dev](https://ucp.dev) and [ucp.quick.shopify.io](https://ucp.quick.shopify.io)
- Not a sellable product -- it is the "plumbing" that enables agentic commerce

**UCP validates:** "The industry is looking to us to define how commerce works in the age of AI."

### The MCP Layer (Model Context Protocol)

Shopify exposes commerce capabilities via MCP servers -- the tool-calling interface that AI agents use:

| MCP Server | Purpose | Docs |
|------------|---------|------|
| **Catalog MCP** | Product discovery, search, variant selection for AI agents | [shopify.dev/docs/agents/catalog/catalog-mcp](https://shopify.dev/docs/agents/catalog/catalog-mcp) |
| **Storefront MCP** | Brand understanding, product search via Storefront API | [shopify.dev/docs/agents/catalog/storefront-mcp](https://shopify.dev/docs/agents/catalog/storefront-mcp) |
| **Checkout MCP** | Cart management, checkout completion, payment processing | [shopify.dev/docs/agents/checkout/mcp](https://shopify.dev/docs/agents/checkout/mcp) |
| **Embedded Checkout Protocol** | Checkout escalation when full agent checkout is not possible | [shopify.dev/docs/agents/checkout/ecp](https://shopify.dev/docs/agents/checkout/ecp) |

### Agentic Storefronts (P0 Mission)

**Aimed by:** Vanessa Lee
**Active projects:** 21

The new commerce surface where AI assistants (ChatGPT, Gemini, Microsoft Copilot, Perplexity, etc.) recommend and sell products directly within conversations.

**How it works for merchants:**
- Merchants toggle AI platforms on/off in their admin
- Shopify handles product syndication, checkout, and full attribution for every order
- No extra plan needed for existing Shopify merchants

**Milestones:**
1. OpenAI V1 -- Early Access for ~30 merchants (shipped)
2. OpenAI V2 -- GA for all merchants with Shop installed
3. Full Partner Solution -- GA for all participating AI Partners

**Active AI Partner Surfaces:**
- ChatGPT (OpenAI) -- live with V1 checkout, V2 imminent
- Google Gemini / AI Mode -- UCP launch partner, imminent
- Microsoft Copilot -- first BFS-certified partner
- Perplexity, Claude, Meta AI, Apple -- in pipeline

### Agentic Plan (New Commercial Product)

A new Shopify plan for **merchants NOT currently on Shopify** who want to participate in agentic commerce without full platform migration:

- No monthly subscription -- merchants pay transaction fees only
- "Sidecar e-commerce stack" that integrates with existing PIM, OMS, and tax systems
- Products synced to Shopify Catalog for automatic syndication to all agentic channels
- Early Access targeting Q1 2026 (US only, Large Accounts and Enterprise)
- Channels: ChatGPT, Google Gemini, Microsoft Copilot + Shop App, Collective, Product Network, Marketplace Connect

### Shopify Catalog

The infrastructure layer that standardizes product data for consumption by AI partners:
- Product data syndication, feed management, AI channel distribution
- Includes data from Shopify's understanding of products (brands, categories, merchant roles)
- Different from a typical product catalog -- this is about making products AI-discoverable
- Described as "Shopify's most important asset over the next decade" (Town Hall Jan 2026)

### Key Agentic Commerce Projects

| Project | Phase | Description |
|---------|-------|-------------|
| Build Universal Commerce Protocol: Checkout | Release | UCP interface for agentic commerce, MCP and API endpoints |
| Agentic Commerce Merchant Enrollment | Release | Build agentic channels in Settings for partner access |
| Agentic Checkout for OpenAI (V1) | Release | Checkout integration enabling purchases within ChatGPT |
| Payment processing for Agentic Checkouts | Observe | Enable payment processing for agentic commerce flows |
| Marketplace Tax for Agentic Commerce | Release | Extend marketplace tax to agentic partner checkouts |
| Move agentic commerce to self-serve model | Observe | Enable any developer to build AI shopping agents on Shopify |
| Order webhooks for post-purchase experiences | Observe | Real-time order updates for AI agents |

---

## Commerce OS Vision

### The 3-Layer Model: Kernel, Platform, Applications

Shopify explicitly models itself as a Commerce Operating System with three layers, directly analogous to a traditional OS:

#### Layer 1: Kernel / Primitives

The fundamental structures and services that all commerce software needs:
- **Commerce domain model**: Orders, products, customers, inventory, fulfillment
- **Core workflows**: The critical paths of commerce (checkout, order processing, inventory management)
- Models what most merchants need, most of the time
- **Core is NOT a microkernel** -- the power of Shopify is that it provides high-performance, secure, cohesive, and integrated behavior

> "Core is the 'kernel' of Shopify's Commerce OS that models the commerce domain from the object model to critical workflows."

**Key principle:** When a capability modeled via extensions meets the "what most merchants need" threshold, it SHOULD be brought into Core.

#### Layer 2: Interfaces / Platform

The APIs, tools, and runtimes that developers use to interact with commerce primitives:

| API/Interface | Purpose |
|--------------|---------|
| **Admin API** (GraphQL + REST) | Read/write merchant store data, products, orders |
| **Storefront API** (GraphQL) | Custom buyer-facing commerce experiences |
| **Metafields & Metaobjects** | Flexible data storage extending the Shopify object model |
| **Shopify Functions** | Managed runtime for custom backend logic (discounts, fulfillment, delivery) |
| **UI Extensions** | Managed runtime for custom UI in admin and buyer experiences |
| **Flow** | Automation engine for merchant workflows |
| **Webhooks** | Event-driven data synchronization |
| **Polaris** | Design system and component library for admin UI |
| **Admin Intents** | Declarative page-specific tools and functions |

#### Layer 3: Applications / Apps

User-facing workflows built on the platform:
- First-party features (everything in the admin)
- First-party apps (Inbox, Forms, Collabs, Collective, etc.)
- Third-party apps (100K+ partner ecosystem across 50 countries)
- Themes and storefronts

**Critical rule:** Apps should never access primitives directly without going through the platform layer.

### Extensibility Architecture

Shopify provides four types of extensibility -- all running in managed runtimes:

1. **Data extensibility** (Metafields/Metaobjects) -- Customize and extend the commerce data model
2. **Backend extensibility** (Shopify Functions) -- Customize backend logic in the commerce loop (discounts, fulfillment, delivery). Equivalent to OS kernel hooks.
3. **Frontend extensibility** (UI Extensions) -- Extend admin and buyer-facing experiences. Equivalent to OS drivers.
4. **APIs, Kits, & SDKs** -- Programmatic access to the OS data model and workflows

**Key design principles:**
- Core enables but does not depend on specific extensions
- Extension points are opinionated and carefully curated (not everything is extensible)
- Extensions run in managed runtimes with strict performance and safety requirements
- Core is the performance floor -- extension SLAs must be at least as good as Core's
- When most merchants need a 1P extension, bring it into Core

### Retail Kernel (Parallel to Commerce OS)

A parallel effort for in-person selling -- a unified "Retail Kernel" providing shared foundation across POS, Mobile, and future surfaces:
- "Build once, deploy everywhere" for retail commerce logic
- Shared payment processing, tax calculations, checkout flows
- Enables rapid global expansion and new surfaces (kiosks, voice commerce)
- Described as "the first major milestone in our Retail OS strategy"

---

## AI Strategy

### Sidekick: The AI Commerce Assistant

**Product:** [vault.shopify.io/products/82-Sidekick](https://vault.shopify.io/products/82-Sidekick)
**Aimers:** Vanessa Lee (overall), Zhong Wu (technical)

Sidekick is Shopify's AI assistant embedded in the admin -- positioned as the "great multiplier of human ambition." Key stats:
- ~1 in 10 enterprise admin users use Sidekick weekly (habitual, not novelty)
- 1 in 3 enterprise admin users used Sidekick in the last quarter
- 20% rise in conversations per user QoQ
- Monthly active users have more than doubled since start of 2025

**Design philosophy (from Q2 2025 Board Letter to investors):**
> "The counterintuitive thing you'd do when designing AI tools is to make them show their work more. Make them engage with the user more; and ask more of their users and not less. Because if you build it this way, the AI doesn't just do the work for you, it teaches you what it's doing, and gives you mastery over the craft of entrepreneurship."

This is a critical design principle: Sidekick teaches merchants ShopifyQL rather than just answering questions. Shopify builds for **mastery**, not just task completion.

### Make Admin AI Native (Mission, 26 Projects)

**Aimed by:** Vanessa Lee | [Vault Link](https://vault.shopify.io/gsd/missions/8540-Make-admin-AI-native)

This mission represents the systematic effort to make AI a first-class citizen throughout the admin experience. All 26 active projects:

**Core Sidekick Capabilities:**
| Project | Phase | Priority |
|---------|-------|----------|
| Sidekick generates apps | Release | P0 |
| Sidekick uses admin intents (forms, chained actions, page-specific tools) | Release | P1 |
| Create Flow automations using Sidekick | Release | P1 |
| Sidekick remembers past conversations | Release | P1 |
| Sidekick identifies next best actions (offline pipeline) | Release | P1 |
| Todo lists for Sidekick | Release | P1 |
| Sidekick can search and use 3P app tools | Release | P1 |
| Reduce error rate to <1% & improve TTFT | Release | P1 |
| Discount Intents for Sidekick | In progress | P1 |
| Customers Sidekick Forms | In progress | P1 |
| Screen share in Admin | Observe | P1 |

**AI-Powered Content & Creative:**
| Project | Phase | Priority |
|---------|-------|----------|
| AI Theme Block Generation (Online Store Editor) | Observe | P1 |
| Help merchants generate product images | Observe | P2 |
| Level up the file editor with sidekick.generate | Release | P2 |
| Multimodal Sidekick | Release | P2 |

**Platform & Extension:**
| Project | Phase | Priority |
|---------|-------|----------|
| Sidekick app extensions: App search for 3P developers | Prototype | P2 |
| Sidekick app extensions: App actions for 3P developers | Build | P2 |
| Sidekick Works Outside of Admin (help center, etc.) | Prototype | P2 |
| Unified mobile extensibility architecture | Prototype | P2 |
| Make Index Screens addressable by AI (mobile) | Prototype | P2 |
| Improve OSE on mobile with Sidekick integration | Prototype | P2 |

**Infrastructure & Reporting:**
| Project | Phase | Priority |
|---------|-------|----------|
| Unify sidekick shared UI elements in Polaris | Release | P2 |
| Data flywheel for segmentation/analytics models | Prototype | P2 |
| Sidekick Platform Reporting | Prototype | P2 |
| Better in-chat streaming tokens | Prototype | P2 |
| /sidekick PDP | Prototype | P2 |

### How Sidekick Uses Admin Intents

A critical architectural pattern: Admin Intents are how Sidekick interacts with the admin at scale.

**Today's limitation:** Sidekick tools are manually coded and don't scale.
**The solution:** Admin Intents let apps/teams declare page-specific tools and functions. Sidekick automatically gets access to ALL intents as they are registered.

This means:
1. Generate a collection image via AI
2. Create a new collection with that image pre-filled
3. Sidekick pops an intent with the collection create flow
4. Sidekick can create net-new forms (e.g., new metaobject definitions)
5. Teams declare new tools scoped to their page or intent

### Broader AI Integration Points

Beyond Sidekick, AI is woven throughout:

- **Admin Web Performance LLM** -- Automated root-cause analysis for performance regressions
- **Escalator** -- AI-powered incident investigation (root cause in 2 minutes, down from 9)
- **AI Translations** -- Migrating marketing and help content to AI translations
- **Catalogue enrichment** -- Product classification, brand/category understanding for search and AI discovery
- **Foundational models** (inspired by Meta's HTSU architecture) -- general purpose merchant/customer representations
- **Model distillation** -- Creating faster, cheaper models for production use at scale (called out as a core capability teams must master)

### Shopify's AI Philosophy

From the Q2 2025 Board Letter:
> "We are not a site making company... We are providing full package service that allows people to not think and free up their brain cycles to do the thing that they actually want to focus on."

From Tobi's AI memo:
> "Reflexive AI usage is now a baseline expectation at Shopify."

91% of Shopifolk agree AI is important to stay relevant in their craft (June 2025 Pulse survey).

---

## Admin-Specific Missions and Projects

### Direct Admin Missions

| Mission | Aimer | Projects | Focus |
|---------|-------|----------|-------|
| **Make admin AI native** | Vanessa Lee | 26 | Sidekick + AI throughout admin |
| **Reportify** | Nicolas Grasset | 14 | Analytics and reporting infrastructure |

### Admin Product Details

**Aimers:** Vanessa Lee (overall), Lawrence Mandel (technical)
**URL:** [vault.shopify.io/products/35-Shopify-Admin](https://vault.shopify.io/products/35-Shopify-Admin)

**Sub-products (33):** Home, Products, Collections, Bundles, Inventory, Orders, Customers, B2B, Discounts, Markets, Fulfillment, Finance, Flow, Sidekick, Growth Ads, Analytics/Reportify, Admin API, Mobile App, Metafields/Metaobjects, Domains, Files, Signup, Subscriptions, Plans & Trials, Shopify Customer Events, and more.

### Active Admin Projects (Selected)

| Project | Phase | Description |
|---------|-------|-------------|
| Unify Index Tables with Better Filtering & Saving | Build | Unified search, filter, display across all index tables |
| Accelerate development with isolated package architecture | Build | Package-based architecture with strict module boundaries |
| Admin Web Performance LLM for root cause analysis | Build | AI-powered performance regression diagnosis |
| Remove Passkey Friction & Improve sign-in UX | Observe | Increase passkey adoption as first-class citizen |
| Migrate marketing content to AI translations | Release | Higher quality, faster turnaround, lower cost |

### Seamless Admin Initiative

A major effort (now foundational) to make the admin feel like a native application:
- Route manifests, data loaders, actions, and form patterns
- View transitions that feel seamless
- Better search results and Sidekick experiences
- Automatic permission handling and eligibility checks

### 2026 Shopify Foundations Priorities (5 Strategic Pillars)

From the Dec 2025 EOY Town Hall:

1. **Admin quality & performance** -- Performance improvements, passkey adoption, mobile enhancements
2. **Business data storage** -- Make metafields/metaobjects first-class citizens, improved bulk APIs
3. **AI-native experiences** -- More proactive and contextual AI (not just additive features)
4. **Analytics & automation** -- Reportify improvements, Flow enhancements
5. **Partner ecosystem** -- Dev dash as primary home for creative builders, proper RBAC

---

## Key Strategic Themes

### Theme 1: Agentic Commerce Leadership (THE defining bet of 2026)

Shopify aims to become synonymous with agent commerce. This is the single most important strategic theme:
- UCP as the industry standard for how agents transact
- Shopify Catalog as the "most important asset over the next decade"
- Agentic Plan extending Shopify's reach beyond current merchants
- Every AI platform (OpenAI, Google, Microsoft, Meta, Perplexity, Anthropic, Apple) as a commerce channel
- 50% of GMV could flow through agent commerce (Tobi's prediction)

**Investment signal:** "If anyone working on UCP asks for help, drop everything and assist" -- Mikhail Parakhin

### Theme 2: AI-Native Platform

AI is not an add-on feature -- it is becoming the primary interaction model:
- Sidekick as the n+1 employee every entrepreneur needs
- Admin Intents as the scalable architecture for AI-admin interaction
- 3P apps exposing tools to Sidekick (app search + app actions)
- Sidekick working outside of admin (help center, etc.)
- Mobile parity for AI capabilities
- AI for internal operations (Escalator, performance analysis)

### Theme 3: Commerce Platform as Infrastructure

Shopify is evolving from "build your store" to "power all of commerce":
- Commerce OS with explicit kernel/platform/application layers
- Best-in-class APIs as a strategic priority ("APIs are just UX for engineers")
- Extensibility architecture (Functions, UI Extensions, Metaobjects) as core differentiator
- Retail Kernel for in-person selling
- 1 checkout engine unifying online and retail

### Theme 4: Buyer-Side and Trust Investment

Major shift toward buyer-facing experiences:
- Shop App as serious marketplace competitor (34 active projects in DAU growth mission)
- Shop Pay, Shop Promise, Shop Login expanding beyond Shopify stores
- Trust battery and consumer trust as enablers of new experiences
- Shopify knowing shipping data, merchant reliability, transaction history = high-trust environment

### Theme 5: Global Expansion and Scale

Infrastructure investments to support global growth:
- Shopify Markets for international commerce
- Yugabyte database migration (42 projects!)
- New networking architecture, edge infrastructure ownership
- 12% of US ecommerce, growing 3x the market (5-6x in Europe)
- GMV growth accelerating to 30%+ YoY for four consecutive years

### Theme 6: Growth and Merchant Acquisition

Active investment in merchant-facing growth:
- "Help me Sell" mission -- growth agent executing plans on merchants' behalf
- Sell for Me -- replacing Marketing tab with Growth tab where merchants set goals and guardrails
- Shopify Ads Engine, Audiences, Campaigns, Product Network
- Performance marketing optimization

---

## How the Admin Fits Into the Broader Platform

### The Admin's Evolving Role

The Shopify Admin is the primary interface where merchants manage their business. But its role is being fundamentally reshaped by three forces:

#### 1. From Manual Management to AI-Assisted Operations

The "Make admin AI native" mission (26 projects) is transforming the admin from a manual management tool to an AI-augmented command center:
- Sidekick as the primary interaction model for complex tasks
- Admin Intents making every page and form AI-addressable
- Proactive AI (next best actions, automated insights) rather than reactive features
- Screen share for AI-assisted support
- Flow automations created conversationally

#### 2. From Sole Commerce Surface to One of Many

The admin used to be THE place merchants interacted with their business. Now it shares that role:
- **Agentic Storefronts** -- AI partners managing discovery and checkout
- **Shop App** -- buyer-side marketplace
- **POS** -- in-person selling
- **Mobile App** -- on-the-go management
- **3P integrations** -- deeper partner integrations via extensibility

The admin becomes the **configuration and intelligence layer** rather than the sole transactional surface.

#### 3. From Monolithic App to Extensible Platform

The Commerce OS architecture positions the admin within the platform layer:
- Admin API and Storefront API as the programmatic interfaces
- UI Extensions and App Extensions making the admin composable
- Admin Intents enabling AI and apps to interact with admin pages
- Polaris as the shared design language
- Seamless Admin making it feel native and performant

### The Admin's Strategic Position

```
                    AI Agents (ChatGPT, Gemini, Copilot...)
                              |
                              | UCP / Catalog MCP / Checkout MCP
                              |
+------------------------------------------------------------------+
|                     SHOPIFY PLATFORM                              |
|                                                                   |
|  +------------------+  +-------------+  +--------------------+   |
|  |  SHOPIFY ADMIN   |  |  SHOP APP   |  |  AGENTIC           |   |
|  |  (merchant ops)  |  |  (buyer     |  |  STOREFRONTS       |   |
|  |                  |  |   discovery) |  |  (agent commerce)  |   |
|  |  - Sidekick      |  |             |  |                    |   |
|  |  - Intents       |  +-------------+  +--------------------+   |
|  |  - Flow          |  +-------------+  +--------------------+   |
|  |  - Extensions    |  |  POS APP    |  |  STOREFRONTS       |   |
|  |  - Analytics     |  |  (retail)   |  |  (online stores)   |   |
|  +------------------+  +-------------+  +--------------------+   |
|                              |                                    |
|              +-------------------------------+                    |
|              |   PLATFORM / API LAYER        |                    |
|              |   Admin API, Storefront API,  |                    |
|              |   Functions, Extensions, Flow  |                    |
|              +-------------------------------+                    |
|                              |                                    |
|              +-------------------------------+                    |
|              |   KERNEL / CORE PRIMITIVES    |                    |
|              |   Orders, Products, Customers,|                    |
|              |   Inventory, Checkout, Catalog |                    |
|              +-------------------------------+                    |
+------------------------------------------------------------------+
```

### What This Means for Rethinking the Admin

1. **The admin is the merchant's command center** -- but increasingly, the intelligence should be proactive (Sidekick next-best-actions, push insights, automated workflows) rather than requiring merchants to navigate menus

2. **The admin must be AI-addressable** -- every page, form, and action needs to work through Admin Intents so Sidekick (and future AI interfaces) can operate them

3. **The admin is one surface of many** -- it needs to provide unified intelligence and configuration that spans all commerce surfaces (online, retail, agentic, mobile)

4. **The admin is an extensibility platform** -- 100K+ partners and their apps are integral to the merchant experience; the admin must compose cleanly with extensions

5. **The admin should teach mastery** -- per Shopify's AI philosophy, the admin should help merchants understand and master their business, not just automate it away

6. **The admin's data model is the commerce model** -- products, orders, customers, inventory are not just "admin features" -- they are the kernel primitives that power all of Shopify. The admin must evolve alongside the kernel.

7. **Agentic commerce changes merchant workflows** -- when AI agents handle discovery and checkout, the merchant's role shifts from managing transactions to managing strategy, brand, and business rules. The admin should reflect this shift.

---

## Appendix: Key Vault Links

### Missions
- [Agentic Storefronts (P0)](https://vault.shopify.io/gsd/missions/8590-Agentic-Storefronts)
- [Make admin AI native](https://vault.shopify.io/gsd/missions/8540-Make-admin-AI-native)
- [World-class product search (P0)](https://vault.shopify.io/gsd/missions/8512-World-class-product-search)
- [Global Product Catalog](https://vault.shopify.io/gsd/missions/7963-Global-Product-Catalog)
- [Shopify, Help me Sell (P1)](https://vault.shopify.io/gsd/missions/8532-Shopify-Help-me-Sell)
- [The best AI recommendations tools in commerce (P1)](https://vault.shopify.io/gsd/missions/8534-The-best-AI-recommendations-tools-in-commerce)
- [Win Retail (P1)](https://vault.shopify.io/gsd/missions/8528-Win-Retail)
- [Reportify](https://vault.shopify.io/gsd/missions/8539-Reportify)

### Products
- [Shopify Admin](https://vault.shopify.io/products/35-Shopify-Admin)
- [Sidekick](https://vault.shopify.io/products/82-Sidekick)
- [Admin API](https://vault.shopify.io/products/94-Admin-API)
- [Flow](https://vault.shopify.io/products/50-Flow)
- [Sell for Me](https://vault.shopify.io/products/152-Sell-for-Me)
- [Catalogue](https://vault.shopify.io/products/65-Catalogue)
- [Checkout](https://vault.shopify.io/products/3-Checkout)
- [Shopify Ecosystem](https://vault.shopify.io/products/93-Shopify-Ecosystem)

### Key Pages
- [Commerce Operating System (3-layer model)](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/overview/platform/Commerce%20Operating%20System)
- [Core is the kernel of Shopify's Commerce OS](https://vault.shopify.io/docs/codex/rfcs/build-extensibly)
- [Agentic Storefronts](https://vault.shopify.io/docs/shopify-platform-and-product/agentic-storefronts)
- [Agentic Plan Handbook](https://vault.shopify.io/docs/craft/18772-Commercial/L&D/Product/WIP-product-fundamentals/Agentic-Plan-Handbook-Page)
- [Sidekick Product Handbook](https://vault.shopify.io/docs/craft/18772-Commercial/L&D/Product/WIP-product-fundamentals/WIP-Sidekick-handbook)
- [Model Context Protocol (MCP) at Shopify](https://vault.shopify.io/docs/technology-and-tools/Model-Context-Protocol)
- [About Retail Kernel & Platform](https://vault.shopify.io/teams/16842-Retail-Kernel-Platform/docs)

### Key TV Episodes (Internal Broadcasts)
- [2026 Themes Town Hall (Jan 15, 2026)](https://vault.shopify.io/tv/series/1-Shopify-Town-Hall/episodes/1359-2026-Themes)
- [Eng+Data Live: UCP & 2026 Priorities (Jan 16, 2026)](https://vault.shopify.io/tv/series/2-Eng-Data-Live/episodes/1355-Eng-Data-Live)
- [Global Revenue Kick Off (Jan 28, 2026)](https://vault.shopify.io/tv/series/9-Revenue/episodes/1356-Global-Revenue-Kick-Off)
- [Shopify Foundations EOY Town Hall (Dec 16, 2025)](https://vault.shopify.io/tv/series/3-Core/episodes/1309-Shopify-Foundations-EOY-Town-Hall)

### External Developer Docs
- [Agentic Commerce](https://shopify.dev/docs/agents)
- [Catalog MCP](https://shopify.dev/docs/agents/catalog/catalog-mcp)
- [Storefront MCP](https://shopify.dev/docs/agents/catalog/storefront-mcp)
- [Checkout MCP](https://shopify.dev/docs/agents/checkout/mcp)
- [Embedded Checkout Protocol](https://shopify.dev/docs/agents/checkout/ecp)
- [UCP Landing Page](https://ucp.dev)

---

*Last updated: 2026-02-05*
*Source: Shopify Vault (internal), compiled for strategic context feeding*
