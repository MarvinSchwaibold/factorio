# Shopify Extensibility Architecture: A Comprehensive Reference

> **Purpose:** A thorough, first-principles guide to Shopify's extensibility architecture -- how Core, extensions, managed runtimes, and the platform layer compose together to form the Commerce Operating System. Written for someone rethinking Admin from first principles.
>
> **Sources:** Internal Vault documentation, Codex RFCs, engineering handbooks, and team pages. All source links at the end.
>
> **Last Updated:** 2026-02-05

---

## Table of Contents

1. [The Extensibility Philosophy: Core + Extensions](#1-the-extensibility-philosophy-core--extensions)
2. [Data Extensibility: Metafields and Metaobjects](#2-data-extensibility-metafields-and-metaobjects)
3. [Backend Extensibility: Functions and Managed Runtimes](#3-backend-extensibility-functions-and-managed-runtimes)
4. [Frontend Extensibility: UI Extensions and App Extensions](#4-frontend-extensibility-ui-extensions-and-app-extensions)
5. [APIs, Kits, and SDKs](#5-apis-kits-and-sdks)
6. [The Channels and Publication Model](#6-the-channels-and-publication-model)
7. [Flow: The Automation Platform](#7-flow-the-automation-platform)
8. [Managed Runtime Principles: Security, Isolation, and Performance SLAs](#8-managed-runtime-principles-security-isolation-and-performance-slas)
9. [When to Bring Extensions into Core vs. Keep as Extensions](#9-when-to-bring-extensions-into-core-vs-keep-as-extensions)
10. [Current Extension Points and Targets in Admin](#10-current-extension-points-and-targets-in-admin)
11. [Vault Source Pages and Further Reading](#11-vault-source-pages-and-further-reading)

---

## 1. The Extensibility Philosophy: Core + Extensions

### The Commerce Operating System Model

Shopify is architected as a **Commerce Operating System** with three distinct layers:

| Layer | Role | Examples |
|-------|------|----------|
| **Kernel / Primitives** | The foundational data models and business logic that define commerce | Orders, Products, Customers, Inventory, Payments |
| **Interfaces / Platform** | APIs, SDKs, and extension surfaces that expose the kernel | Admin API, Storefront API, App Bridge, Extension Points |
| **Applications / Apps** | First-party and third-party software built on the platform | Sales channels, marketing tools, shipping solutions |

This three-layer model is the conceptual foundation for everything that follows. The kernel is opinionated about commerce; the platform layer is opinionated about how extensions interact with the kernel; apps are the creativity layer where anyone can build.

### Core as the Kernel

The **Build Extensibly RFC** -- one of the foundational Codex documents -- establishes that **Core is the "kernel" of Shopify's Commerce Operating System**. Core's job is to:

- **Model what most merchants need** as first-class platform capabilities
- **Enable extensions** to handle the long tail of customization
- **Never depend** on specific extensions for its own operation

Core provides the default, opinionated experience. Extensions augment, customize, and specialize that experience for specific merchant needs, verticals, and workflows.

### The Four Extensibility Primitives

Shopify's extensibility architecture rests on **four foundational primitives**:

1. **Metafields and Metaobjects** (Data Extensibility) -- Extend Shopify's data model with custom fields and custom objects, enabling apps and merchants to store structured data alongside core resources.

2. **Functions** (Backend/Runtime Extensibility) -- Execute custom business logic at specific decision points within Shopify's backend, running in a managed WebAssembly runtime.

3. **UI Extensions** (Frontend Extensibility) -- Render custom user interfaces within Shopify-owned surfaces (Admin, Checkout, POS) in a sandboxed, managed environment.

4. **APIs, Kits, and SDKs** (Programmatic Access) -- The GraphQL and REST APIs, plus developer tooling, that provide full programmatic access to Shopify's platform.

### The Extensibility Suite as a Stack

These primitives compose into a layered **Extensibility Suite**:

```
+-----------------------------------------------------+
|               UI Layer                              |
|  UI Extensions (Remote UI) + App Bridge             |
+-----------------------------------------------------+
|          Business Logic Layer                       |
|     Functions (ShopifyVM) + Flow                    |
+-----------------------------------------------------+
|              Data Layer                             |
|     Custom Data (Metafields + Metaobjects)          |
+-----------------------------------------------------+
|            Access Layer                             |
|      GraphQL APIs + Kits + SDKs                     |
+-----------------------------------------------------+
```

Each layer has its own managed runtime, its own isolation guarantees, and its own performance SLAs.

### Key Architectural Principles

From the Build Extensibly RFC and Extensibility Principles:

1. **Dogfood the Extensibility Suite** -- First-party apps should use the same extension primitives as third-party apps. If the platform isn't good enough for 1P, it isn't good enough.

2. **Core enables but doesn't depend on extensions** -- Core must never query specific metafield values, depend on specific Functions outputs, or rely on a particular extension being installed.

3. **Opinionated extension capabilities** -- Rather than exposing raw, unopinionated hooks, Shopify designs extension points that are semantically meaningful and commerce-aware.

4. **Merchants control capabilities** -- Merchants decide which apps and extensions are active. The platform mediates between merchant intent and app capabilities.

5. **Performance is never a reason not to use the platform** -- Extensions must perform at least as well as Core. If they can't, that's a platform problem to solve, not a reason to bypass the platform.

6. **Document frustrations** -- When building with the Extensibility Suite is painful, document the friction. This feedback loop improves the platform for everyone.

7. **Flow for merchant automations** -- Flow is the default automation engine. Don't build custom automation UIs; build Flow triggers and actions.

8. **Core primitives via public APIs** -- All Core capabilities should be accessible through public APIs. Internal-only APIs are technical debt.

---

## 2. Data Extensibility: Metafields and Metaobjects

### The Custom Data System

The **Data Extensions RFC** defines Shopify's approach to data extensibility through the **Custom Data System**, which consists of two primary primitives:

- **Metafields** -- Custom fields attached to existing Shopify resources (products, orders, customers, etc.)
- **Metaobjects** -- Standalone custom objects with their own schema, enabling entirely new data types

Together, these form a **Shopify-opinionated, commerce-oriented type system** that extends Shopify's data model without breaking its integrity.

### Six Principles of Data Extensibility

The Data Extensions RFC establishes six foundational principles:

#### 1. Scale to Every Merchant
The Custom Data System must work for the simplest merchant adding a single custom field and for the most complex enterprise with thousands of metafield definitions across millions of resources.

#### 2. Core Must Never Read Specific Metafield Values
This is a hard architectural boundary. Core systems (orders, products, checkout) must never query or depend on the value of a specific metafield namespace/key. This ensures that Core remains decoupled from extension data and that the extension boundary is never violated.

**Why this matters for Admin:** When building Admin surfaces, Core UI should render metafield data generically (using the type system to determine display) rather than interpreting specific metafield values.

#### 3. Commerce-Oriented Type System
The type system is not a generic key-value store. It includes types that are meaningful for commerce:
- References to other Shopify resources (product references, collection references)
- Rich types like money, weight, dimension, rating
- JSON for complex structured data
- File references for media

#### 4. Standards Enable Interoperability
Standard metafield definitions create shared vocabulary across the ecosystem. When a product has a `custom.care_instructions` standard metafield, any app can read/write it predictably. This enables four interoperability patterns:
- **P2P** (Platform-to-Platform): Core surfaces exposing standard metafields
- **P2A** (Platform-to-App): Apps reading platform-defined standard fields
- **A2A** (App-to-App): Apps interoperating through shared standard definitions
- **A2P** (App-to-Platform): Apps writing data that Core surfaces display

#### 5. Performant as Core
Custom data access must match Core data access in performance:
- **Constant-time reads** for metafield access
- **Stale reads** within 100ms
- **ACID guarantees** for writes
- **Up to 1024 definitions** per resource type

#### 6. All Data Associated with Shops, Orgs, and Apps
Every piece of custom data has a clear ownership chain. Data belongs to a shop or organization and is scoped to the app that created it. Access control is additive -- apps must explicitly grant access to their metafields.

### Practical Implications for Admin

When designing Admin experiences:

- **Generic rendering**: Admin should render metafield data using the type system, not by hardcoding specific metafield keys. A "product metafield card" renders whatever metafields are defined, using type-appropriate inputs and displays.
- **Standard definitions**: Leverage standard metafield definitions to create consistent experiences across 1P and 3P.
- **Access scoping**: Respect app-scoped access. An app's metafields are private by default; the app must grant read/write access to other apps or to the storefront.
- **Performance expectations**: Metafield reads should be as fast as reading any Core field. If they're not, that's a platform bug.

---

## 3. Backend Extensibility: Functions and Managed Runtimes

### Shopify Functions Overview

**Shopify Functions** allow developers to customize Shopify's backend logic at specific decision points. They are the backend extensibility primitive -- the way to inject custom business logic into Shopify's transaction processing pipeline.

Functions are **synchronous** and **deterministic**. They receive a structured input (JSON), process it, and return a structured output (JSON). They do not make network calls, access databases, or perform I/O. They are pure computation.

### ShopifyVM: The WebAssembly Runtime

The **Functions Platform and ShopifyVM RFC** details the technical foundation:

**ShopifyVM** is Shopify's purpose-built WebAssembly runtime for executing Functions. Key properties:

- **Hermetic**: No network, no filesystem, no I/O. Functions receive their entire world as input.
- **Parallelized**: Multiple Functions can execute concurrently without interference.
- **Deterministic**: Given the same input, a Function always produces the same output.
- **Sandboxed**: Functions run in a separate process from the Core application, communicating via IPC (not TCP).

### Resource Limits

Functions operate under strict, well-defined limits:

| Resource | Default Limit | Notes |
|----------|---------------|-------|
| **Input size** | 64 kB | JSON input payload |
| **Output size** | 20 kB | JSON output payload |
| **Fuel (instructions)** | 11 million | Roughly equivalent to computation time |
| **Memory** | 10 MB | Linear memory for the Wasm module |
| **Module size** | 256 kB | Compiled WebAssembly binary |
| **Active Functions per API** | 25 | Per shop, per Function API |

### Performance SLAs

Functions are designed to be **invisible to the merchant and buyer**:

| Metric | Target |
|--------|--------|
| **Platform overhead** | < 1ms P90 |
| **Single invocation** | < 5ms P90 |
| **Cumulative effect** (all Functions in a request) | < 100ms P90 |

### Dynamic Limit Scaling

For large inputs (e.g., carts with many line items), the platform supports **dynamic limit scaling up to 10x** the default limits. This is negotiated at the API level, not by individual Functions.

### Current Function APIs

Functions are available at specific backend decision points. Examples include:

- **Discount Functions** -- Custom discount logic (product discounts, order discounts, shipping discounts)
- **Payment Customization** -- Reorder, rename, or hide payment methods at checkout
- **Delivery Customization** -- Reorder, rename, or hide delivery options at checkout
- **Cart Transform** -- Modify cart line items (bundles, upsells)
- **Fulfillment Constraints** -- Custom fulfillment routing logic
- **Order Routing** -- Custom order routing decisions
- **Validation Functions** -- Validate cart/checkout state against custom rules

### Practical Implications for Admin

- **Admin surfaces for Function configuration**: When a Function is installed, Admin needs to provide configuration UI. This is typically done through UI Extensions (Action or Block extensions) that allow merchants to set up and manage Function parameters.
- **Functions + UI Extensions pattern**: The most common extensibility pattern is a Function (backend logic) paired with a UI Extension (merchant-facing configuration in Admin). This is how discount apps, payment customizations, and delivery customizations work.
- **No direct Admin integration**: Functions themselves have no Admin surface. They are purely backend. All merchant-facing interaction happens through UI Extensions or Admin API integrations.

---

## 4. Frontend Extensibility: UI Extensions and App Extensions

### UI Extensions Architecture

**UI Extensions** are the frontend extensibility primitive. They allow apps to render custom user interfaces within Shopify-owned surfaces -- Admin, Checkout, POS, and more.

#### Technical Architecture

UI Extensions run in a **managed, sandboxed environment**:

```
+----------------------------------------------+
|              Host Application                |
|         (Admin, Checkout, POS)               |
|                                              |
|  +--------------------------------------+    |
|  |          Extension Host              |    |
|  |   +-------------+  +------------+   |    |
|  |   |  Sandbox    |  |  RPC Proxy |   |    |
|  |   |  (Worker)   |<>|   Layer    |   |    |
|  |   |             |  |            |   |    |
|  |   |  Extension  |  |  Remote UI |   |    |
|  |   |   Code      |  |  Bridge    |   |    |
|  |   +-------------+  +------------+   |    |
|  +--------------------------------------+    |
|                                              |
+----------------------------------------------+
```

- **Sandbox**: On web, extensions run in **Web Workers**. On iOS/Android, they run in a **headless JavaScript engine**. This provides process-level isolation from the host application.
- **Remote UI**: Extensions describe their UI as a component tree (using Shopify's component library), which is serialized and rendered by the host application. Extensions never have direct DOM access.
- **RPC Proxy Layer**: Communication between the extension sandbox and the host application happens through a structured RPC protocol, not direct API calls.

#### Why Managed Rendering Matters

This architecture has critical implications:

1. **Performance isolation**: A slow or buggy extension cannot block the host application's main thread.
2. **Security**: Extensions cannot access the host's DOM, cookies, or session data.
3. **Consistency**: All extensions use the same component library, ensuring visual consistency with Shopify's design system.
4. **Cross-platform**: The same extension code runs on web, iOS, and Android because it describes UI declaratively rather than imperatively.

### Admin UI Extension Types

In Admin specifically, there are **three primary extension types**:

#### 1. Action Extensions
- **Surface**: Appear in the "More actions" menu on resource detail pages
- **Rendering**: Open as a **modal overlay** when activated
- **Use cases**: One-time operations, form submissions, data exports, complex workflows
- **Quantity**: Unlimited per app; sorted by frequency and recency of use
- **Key constraint**: Must be explicitly triggered by the merchant

#### 2. Block Extensions
- **Surface**: Appear as **cards on resource detail pages** (Products, Orders, Customers)
- **Rendering**: Rendered inline within the page, as collapsible cards
- **Use cases**: Displaying contextual information, showing extension state, lightweight configuration
- **Behavior**: Minimized by default; merchants can expand/collapse
- **Key constraint**: Maximum card height of 600px; no quantity limits per app
- **Important**: Block extensions are the primary way apps surface information in Admin resource detail pages

#### 3. Link Extensions
- **Surface**: Appear as **admin links and bulk action options**
- **Rendering**: Navigate to an app page or trigger an action
- **Use cases**: Quick navigation to app functionality, bulk operations
- **Key constraint**: Lightweight; primarily for navigation and triggering

### UI Extension Groups

Extensions are organized into **UI Extension Groups** -- logical aggregations of related extension points with shared rules. Current groups include:

- **Action extension** -- Admin action modals
- **Admin appHome** -- App home page within Admin
- **Admin product configuration** -- Product-level configuration surfaces
- **Block extension** -- Admin detail page blocks
- **Checkout rules** -- Checkout validation and customization
- **Checkout UI** -- Custom UI within checkout flow
- **Customer account UI** -- Customer account portal extensions
- **POS UI** -- Point of Sale interface extensions

### Non-Generic UI Extensions

For critical functionality, Shopify also provides **non-generic (purpose-built) UI extensions** that go beyond the standard Action/Block/Link pattern:

- **Product bundles configuration** -- Dedicated extension surface for bundle setup
- **Checkout validations UI** -- Specialized validation configuration
- **Subscription configuration** -- Subscription plan management

These exist where the generic patterns are insufficient for the complexity of the merchant experience.

### Quality Controls

To maintain a consistent merchant experience:

- Extensions use a **constrained component library** (not arbitrary HTML/CSS)
- **App Store requirements** enforce quality standards
- **Built for Shopify (BFS) program** certifies high-quality extensions
- Admin-specific rules govern card dimensions, interaction patterns, and loading states

### Practical Implications for Admin

- **Extension placement is semantic**: Extension points are tied to specific resource types and page locations. "Where does this extension appear?" is a first-class design question.
- **Merchant control**: Merchants can reorder, minimize, and disable block extensions. Admin should provide clear management surfaces for installed extensions.
- **Loading states matter**: Because extensions load asynchronously from the host, Admin must handle loading, error, and empty states gracefully.
- **Component library is the contract**: The set of available components defines what extensions can render. Expanding the component library expands what extensions can do.

---

## 5. APIs, Kits, and SDKs

### GraphQL as the Public API

Shopify's public API strategy is centered on **GraphQL**. The Codex RFC "GraphQL Is Our Public API" establishes that:

- **GraphQL Admin API** is the primary programmatic interface to Shopify's platform
- All new functionality should be exposed through GraphQL mutations and queries
- REST APIs exist for backward compatibility but are not the forward-looking interface

### API Layers

| API | Purpose | Consumers |
|-----|---------|-----------|
| **Admin API (GraphQL)** | Full CRUD access to shop data and configuration | Apps, scripts, integrations |
| **Storefront API** | Read-optimized access to product, collection, and shop data | Storefronts, headless commerce |
| **Customer Account API** | Authenticated customer data access | Customer portals, loyalty apps |
| **Payments Apps API** | Payment processing integration | Payment gateways |
| **Fulfillment Service API** | Fulfillment workflow integration | 3PLs, fulfillment services |

### App Bridge

**App Bridge** is the communication layer between embedded apps/extensions and the Shopify host (Admin, POS, etc.). It provides:

- **Navigation**: Control the host's navigation (redirect, modal open/close)
- **Authentication**: Session tokens and OAuth flows
- **Resource Picker**: Standardized pickers for products, collections, customers
- **Toast notifications**: Feedback messages within the host UI
- **Context**: Information about the current merchant, shop, and surface

App Bridge is the glue between embedded apps and Shopify's host applications. It is maintained by the **App UI team** (Team 3013 - Extensibility).

### Developer Tooling

- **Shopify CLI**: Project scaffolding, extension development, deployment
- **Shopify App Templates**: Starter templates for common app patterns
- **Extension-only apps**: Apps that consist entirely of extensions (no separate app server needed for simple use cases)
- **Dev stores**: Free development environments for testing

---

## 6. The Channels and Publication Model

### Channels as Apps

In Shopify's architecture, **sales channels are apps**. The Online Store, POS, Google Shopping, Facebook Shop, and custom storefronts are all channel apps that connect to Shopify's platform through the same APIs and extension points.

This has a profound implication: **the same extensibility architecture that powers third-party apps also powers Shopify's own sales channels**.

### Key Concepts

| Term | Definition |
|------|------------|
| **Channel** | A surface where merchants can market or sell products |
| **Channel App** | An app that implements a channel's connection to Shopify |
| **Channel Platform** | The infrastructure that powers channel apps |
| **Channel Connection** | The link between a shop and a channel |
| **Channel Specification** | The schema defining a channel's capabilities |
| **Sales Channel** | A channel where transactions occur |
| **Product Feed** | Product data syndicated to a channel |
| **Publication** | The mechanism controlling which products are available on which channels |
| **Attribution** | Tracking which channel drove a sale |

### The Publication Model

Products in Shopify are **published to channels** through the publication model:

- A product can be published to zero, one, or many channels
- Each channel has its own publication status per product
- Merchants control product availability per channel through Admin
- APIs expose publication management for programmatic control

This model means Admin must provide:
- Per-product channel visibility controls
- Bulk publishing/unpublishing operations
- Channel-specific product requirements (e.g., some channels require specific metafields)
- Publication status as a first-class product attribute

### Practical Implications for Admin

- **Channel management is app management**: Adding a new sales channel means installing a channel app. Admin's channel management surface is an extension of its app management surface.
- **Product publishing is per-channel**: Admin product pages need to show and control per-channel availability.
- **Channel apps use the same extension points**: Channel apps can have Admin UI Extensions, Functions, and all other extension types.

---

## 7. Flow: The Automation Platform

### Flow as the Default Automation Engine

**Shopify Flow** is Shopify's built-in automation platform. A core extensibility principle states: **"Flow is the default automation engine for merchant customizations."**

This means:
- Apps should **not** build custom automation UIs
- Apps should expose their capabilities as **Flow triggers and actions**
- Merchants build automations in Flow's visual builder using these triggers and actions

### Flow Architecture

Flow operates on a **trigger-condition-action** model:

```
Trigger (event occurs)
  +-- Condition (evaluate criteria)
       +-- Action (do something)
```

- **Triggers**: Events that start a workflow (order created, product updated, customer tagged, etc.)
- **Conditions**: Logic gates that filter which events proceed (if order total > $100, if customer has tag "VIP")
- **Actions**: Operations performed when conditions are met (send email, add tag, create task, call API)

### App Integration with Flow

Apps extend Flow by providing:
- **Custom Triggers**: New events that can start workflows (e.g., "loyalty points earned", "review submitted")
- **Custom Actions**: New operations that workflows can perform (e.g., "send SMS", "update CRM record")
- **Flow Connectors**: The integration points between apps and Flow

### Practical Implications for Admin

- **Admin doesn't need custom automation surfaces**: If a workflow can be expressed as trigger + condition + action, it belongs in Flow, not in a custom Admin page.
- **Flow configuration in Admin**: Merchants access Flow from Admin's navigation. Flow templates and workflow management are Admin surfaces.
- **App-provided automations appear in Flow**: When an app installs Flow triggers/actions, they appear in Flow's builder automatically. Admin doesn't need to build separate surfaces for each app's automations.

---

## 8. Managed Runtime Principles: Security, Isolation, and Performance SLAs

### The Managed Runtime Philosophy

A defining characteristic of Shopify's extensibility architecture is that **all extension execution happens in managed runtimes**. This is not incidental -- it is a deliberate architectural decision with deep implications.

### Why Managed Runtimes?

| Concern | Unmanaged Approach | Managed Runtime Approach |
|---------|-------------------|--------------------------|
| **Performance** | App server latency varies wildly | Strict SLAs enforced by the platform |
| **Security** | Apps can access anything on their server | Sandboxed execution with explicit capabilities |
| **Reliability** | If app server is down, extension fails | Platform manages availability and fallbacks |
| **Consistency** | Apps render arbitrary HTML/CSS | Component library ensures visual consistency |
| **Cross-platform** | Separate implementations per surface | Write once, render anywhere |

### Runtime Isolation Properties

#### Functions (ShopifyVM)
- **Process isolation**: Functions run in a separate process from Core
- **Communication**: IPC, not TCP (no network overhead)
- **No I/O**: No network, filesystem, or database access
- **Deterministic**: Same input always produces same output
- **Fuel-limited**: Execution budget prevents runaway computation
- **Memory-limited**: Fixed memory ceiling prevents resource exhaustion

#### UI Extensions (Remote UI)
- **Thread isolation**: Extensions run in Web Workers (web) or headless JS engines (mobile)
- **No DOM access**: Extensions describe UI declaratively; the host renders it
- **Component-constrained**: Only approved components can be rendered
- **RPC-mediated**: All host communication goes through a structured protocol
- **Timeout policies**: Extensions that take too long to render are terminated

### Performance SLA Framework

The Build Extensibly RFC establishes a critical principle: **Extension SLAs must be at least as good as Core's**.

This means:
- If a Core page loads in 200ms, the same page with extensions must still load in approximately 200ms
- Extension overhead should be imperceptible to merchants and buyers
- If the platform cannot meet this bar, the platform needs to be improved -- not the extension bypassed

Specific targets:
- **Functions**: Platform overhead < 1ms P90, invocation < 5ms P90, cumulative < 100ms P90
- **UI Extensions**: Must not block the host application's main thread
- **Metafield reads**: Constant-time, stale reads within 100ms

### Circuit Breakers and Fallbacks

The platform implements circuit breakers for extension execution:
- If an extension consistently fails or times out, the platform can disable it
- Core must always have a sensible default behavior when extensions are absent
- Degradation is graceful -- removing a broken extension should never break Core

### Security Model

- **Capability-based access**: Extensions declare what they need; the platform grants explicit capabilities
- **App scoping**: Extension data access is scoped to the installing app's permissions
- **Merchant consent**: Merchants explicitly install apps and grant permissions
- **No ambient authority**: Extensions cannot escalate privileges beyond what was granted

---

## 9. When to Bring Extensions into Core vs. Keep as Extensions

### The Promotion Principle

The Build Extensibly RFC establishes a clear guideline:

> **When most merchants need a first-party extension, bring it into Core.**

This is not a suggestion -- it is an architectural principle. The decision framework:

### Decision Framework

```
Is this capability needed by most merchants?
+-- YES --> Should be in Core
|           (Model it as a first-class platform feature)
|
+-- NO --> Should be an extension
            +-- Is it a common pattern across verticals?
            |   +-- YES --> Build as a 1P extension using the platform
            |   +-- NO --> Let 3P apps handle it
            |
            +-- Is the extension pattern inadequate?
                +-- YES --> Improve the extension platform
                +-- NO --> The extension approach is correct
```

### Signals That Something Belongs in Core

1. **Majority merchant need**: More than 50% of merchants would use this capability
2. **Foundational dependency**: Other features or extensions need this to function
3. **Performance-critical path**: The capability is on a latency-critical path (checkout, storefront rendering)
4. **Data integrity**: The capability involves Core data model changes that affect platform guarantees
5. **Cross-cutting concern**: The capability spans multiple surfaces and isn't scoped to a single extension point

### Signals That Something Should Remain an Extension

1. **Vertical-specific**: Only relevant to certain merchant segments (fashion, food, B2B)
2. **Opinionated workflow**: Implements a specific approach to a problem (one of many valid approaches)
3. **Third-party integration**: Connects to external services (shipping carriers, payment processors, marketing platforms)
4. **Rapid iteration needed**: The capability is still evolving and benefits from the flexibility of the extension model
5. **Composability**: The capability should be mix-and-match with other extensions

### The 1P Extension Pattern

When something shouldn't be in Core but Shopify still needs to provide a solution, the answer is a **first-party extension built on the platform**:

- 1P extensions use the same APIs, extension points, and managed runtimes as 3P extensions
- This "dogfooding" ensures the platform is robust enough for real-world use
- The Extensibility Principles explicitly state: **"Principles for excellent 1P apps"** -- 1P apps should be exemplary users of the platform

### Auto-Installed Capabilities

A middle ground exists: **auto-installed capabilities**. These are extensions that are installed by default but can be disabled or replaced by merchants. This pattern:
- Provides a default experience without cluttering Core
- Allows merchants to swap in preferred alternatives
- Keeps Core focused on foundational primitives

---

## 10. Current Extension Points and Targets in Admin

### Understanding Extension Points

An **extension point** (or "target") is a semantic location in a Shopify-owned surface where an extension can connect. The Build Extensibly RFC FAQ explicitly addresses how to think about designing extension points:

- Extension points should be **semantically meaningful** (not just "inject arbitrary UI here")
- They should be **commerce-aware** (tied to specific merchant tasks and resources)
- They should have **clear contracts** (what input does the extension receive? what output is expected?)

### Admin Extension Surfaces

Extensions in Admin are currently available on these surfaces:

#### Resource Detail Pages
| Resource | Block Extensions | Action Extensions | Links |
|----------|-----------------|-------------------|-------|
| **Products** | Yes (detail page cards) | Yes (More actions menu) | Yes |
| **Orders** | Yes (detail page cards) | Yes (More actions menu) | Yes |
| **Customers** | Yes (detail page cards) | Yes (More actions menu) | Yes |

#### App-Specific Surfaces
| Surface | Extension Type | Description |
|---------|---------------|-------------|
| **App Home** | Admin appHome | Full-page app experience within Admin |
| **Product Configuration** | Admin product configuration | Product-level settings for app functionality |

#### Checkout and Payment Surfaces (Admin-configured, rendered elsewhere)
| Surface | Extension Type | Description |
|---------|---------------|-------------|
| **Checkout UI** | Checkout UI extensions | Custom UI rendered during checkout (configured in Admin) |
| **Checkout Rules** | Checkout validation | Validation rules for checkout flow |
| **Payment Customization** | Functions | Backend logic for payment method display |
| **Delivery Customization** | Functions | Backend logic for delivery option display |

### Extension Point Scope

Current extension points are limited to these Shopify-owned surfaces:

1. **Admin** -- Merchant-facing management interface
2. **Checkout** -- Buyer-facing purchase flow
3. **Storefront** -- Buyer-facing browsing experience (via theme app extensions)
4. **POS** -- In-person sales interface
5. **Self-Serve** -- Customer self-service (returns, accounts)
6. **Flow** -- Automation triggers and actions

### The "Target" Concept

From the App Platform Concepts documentation:

A **target** is the specific location where an extension connects to Shopify-owned technology. Targets are identified by strings like:

- `admin.product-details.block.render` -- A block extension on the product detail page
- `admin.order-details.action.render` -- An action extension on the order detail page
- `purchase.checkout.block.render` -- A block extension in the checkout flow

Each target defines:
- **Input context**: What data the extension receives (current product, order, customer, etc.)
- **Component availability**: Which UI components are available at that target
- **Lifecycle**: When the extension is mounted, updated, and unmounted
- **Constraints**: Size limits, interaction patterns, performance budgets

### What This Means for Rethinking Admin

If you're rethinking Admin from first principles, the extension point map is your most critical design artifact:

1. **Every Admin page is a potential extension host**: Consider where on each page extensions should be able to appear.
2. **Extension points define the platform's surface area**: Adding a new extension point is a platform commitment. Removing one is a breaking change.
3. **Semantic > positional**: "Product detail page block" is better than "right sidebar slot #3". Extension points should be tied to merchant intent, not pixel coordinates.
4. **Extension density management**: As more apps install extensions on the same page, Admin must manage density, prioritization, and organization of extension UI.
5. **Extension discovery**: Merchants need to understand what extensions are available, where they appear, and how to manage them. This is an Admin responsibility, not an extension responsibility.

---

## 11. Vault Source Pages and Further Reading

### Core Architecture Documents

| Document | Vault URL | Description |
|----------|-----------|-------------|
| **Build Extensibly RFC** | [vault.shopify.io/docs/codex/rfcs/build-extensibly](https://vault.shopify.io/docs/codex/rfcs/build-extensibly) | The foundational RFC defining Core + Extensions architecture |
| **Commerce Operating System** | [vault.shopify.io/docs/craft/.../Commerce Operating System](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/overview/platform/Commerce%20Operating%20System) | The 3-layer OS model (Kernel, Interfaces, Applications) |
| **Extensibility Principles** | [vault.shopify.io/docs/craft/.../extensibility/principles](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/overview/platform/extensibility/principles) | Eight principles for building extensibly |
| **Codex RFC Index** | [vault.shopify.io/docs/codex/rfcs](https://vault.shopify.io/docs/codex/rfcs) | Index of all Codex RFCs |

### Data Extensibility

| Document | Vault URL | Description |
|----------|-----------|-------------|
| **Data Extensions RFC** | [vault.shopify.io/docs/codex/rfcs/data-extensions](https://vault.shopify.io/docs/codex/rfcs/data-extensions) | Custom Data System architecture (metafields + metaobjects) |

### Backend Extensibility

| Document | Vault URL | Description |
|----------|-----------|-------------|
| **Functions Platform and ShopifyVM RFC** | [vault.shopify.io/docs/codex/rfcs/functions-platform-and-shopifyvm](https://vault.shopify.io/docs/codex/rfcs/functions-platform-and-shopifyvm) | WebAssembly runtime for Functions |
| **Shopify Functions** | [vault.shopify.io/teams/...Shopify Functions](https://vault.shopify.io/teams/19026-Shopify-Functions/docs/) | Functions team documentation |

### Frontend Extensibility

| Document | Vault URL | Description |
|----------|-----------|-------------|
| **UI Extensions (Engineering)** | [vault.shopify.io/docs/craft/.../ui-extensions](https://vault.shopify.io/docs/craft/2200-Engineering/development_handbook/developing_at_Shopify/apps/extensions/ui-extensions) | Technical architecture of UI Extensions |
| **Designing with Admin UI Extensions** | [vault.shopify.io/docs/.../design-with-ui-extensions](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/design-with-ui-extensions) | UX patterns for Admin extensibility |
| **App UI Team** | [vault.shopify.io/teams/3013-Extensibility](https://vault.shopify.io/teams/3013-Extensibility/docs) | Team owning Admin Extensibility, App Bridge, Unified Extensibility Host |

### Platform and Apps

| Document | Vault URL | Description |
|----------|-----------|-------------|
| **App Module Framework** | [vault.shopify.io/teams/.../app-module-framework](https://vault.shopify.io/teams/2080-Shopify-Foundations/docs/~Archive/essential-dx-resources/why-the-app-module-framework) | Infrastructure for extension distribution, versioning, lifecycle |
| **Key App Platform Concepts** | [vault.shopify.io/teams/.../App-platform-concepts](https://vault.shopify.io/teams/2080-Shopify-Foundations/docs/~Archive/essential-dx-resources/4718-App-platform-concepts) | Domain model for apps, extensions, and targets |
| **Principles for Excellent 1P Apps** | [vault.shopify.io/docs/.../principles-for-excellent-1p-apps](https://vault.shopify.io/docs/Shopify-App-Store/principles-for-excellent-1p-apps) | How 1P apps should use the platform |

### Channels and Automation

| Document | Vault URL | Description |
|----------|-----------|-------------|
| **Channels Platform** | [vault.shopify.io/teams/15257-Channels-Platform](https://vault.shopify.io/teams/15257-Channels-Platform/docs/team) | Channels Platform team and glossary |

### Onboarding and Overview

| Document | Vault URL | Description |
|----------|-----------|-------------|
| **Intro to Extensibility (Self-Serve)** | [vault.shopify.io/teams/.../intro-to-extensibility](https://vault.shopify.io/teams/110-Self-Serve/docs/platform/extensibility/onboarding/intro-to-extensibility) | Beginner-friendly extensibility overview |

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **Core** | Shopify's foundational platform -- the "kernel" of the Commerce OS |
| **Extension** | A modular piece of functionality that augments Core via a managed runtime |
| **Extension Point / Target** | A semantic location in a Shopify surface where an extension can connect |
| **Managed Runtime** | A sandboxed execution environment with enforced resource limits and SLAs |
| **Metafield** | A custom field attached to an existing Shopify resource |
| **Metaobject** | A standalone custom data object with its own schema |
| **Function** | A WebAssembly module that executes custom backend logic at a defined decision point |
| **UI Extension** | A sandboxed frontend component that renders within a Shopify-owned surface |
| **App Bridge** | The communication layer between embedded apps/extensions and Shopify's host |
| **Remote UI** | The serialization protocol that allows extensions to describe UI rendered by the host |
| **ShopifyVM** | Shopify's purpose-built WebAssembly runtime for Functions |
| **Flow** | Shopify's built-in trigger-condition-action automation platform |
| **Channel** | A surface (app) where merchants market or sell products |
| **Publication** | The mechanism controlling product availability across channels |
| **App Module** | The infrastructure unit for distributing, versioning, and managing extension code |
| **UI Extension Group** | A logical aggregation of related extension points with shared rules |
| **Standard Metafield Definition** | A platform-defined metafield schema enabling cross-app interoperability |

---

*This document synthesizes internal Vault documentation as of February 2026. Architecture evolves -- always check the linked Vault pages for the latest information.*
