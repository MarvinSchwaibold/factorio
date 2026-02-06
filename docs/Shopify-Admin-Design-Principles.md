# Shopify Admin Design Principles & Patterns

> A comprehensive reference document synthesized from internal Vault documentation, Polaris guidelines, and Tobi Lutke's foundational memos. Intended as context for rethinking the Admin from first principles.

---

## Table of Contents

1. [Foundational Philosophy: The "One Author" Vision](#1-foundational-philosophy-the-one-author-vision)
2. [Navigation Philosophy: The L-Shaped Frame](#2-navigation-philosophy-the-l-shaped-frame)
3. [Wayfinding & Navigation Pillars](#3-wayfinding--navigation-pillars)
4. [Admin Home Strategy: Merchant Hierarchy of Needs](#4-admin-home-strategy-merchant-hierarchy-of-needs)
5. [Flexible Indexes Pattern](#5-flexible-indexes-pattern)
6. [Admin Productivity Loop](#6-admin-productivity-loop)
7. [Admin Communications System](#7-admin-communications-system)
8. [Polaris Design System](#8-polaris-design-system)
9. [Voice & Tone Guidelines](#9-voice--tone-guidelines)
10. [Settings Design Principles](#10-settings-design-principles)
11. [Mobile Admin Principles](#11-mobile-admin-principles)
12. [Core Product Principles (Tobi's Memo)](#12-core-product-principles-tobis-memo)

---

## 1. Foundational Philosophy: The "One Author" Vision

**Source:** [Admin Design](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design) | [Store Management Core Principles](https://vault.shopify.io/docs/get-to-know-shopify/Get-to-know-Tobi/16924-Memos-from-Tobi-Lutke/Store%20Management%20Core%20Principles)

> "Admin is a tool designed by many hands that should feel as though it were designed by one."

This is the single most important principle governing the Shopify Admin. The Admin is collectively designed by hundreds of teams, but to the merchant it must appear as a coherent, singular product. Every PM and designer must learn to match the stylistic approach, pace, narrative, and taste of the existing work.

Tobi's book metaphor is canonical:

> "Great software is designed the way great books are written. A great product has a pace, a familiarity. It picks up at an engaging spot and draws people in. It creates an environment that's consistent, a narrative that's intuitive, and a flow that connects the entire work."

**Key implications:**
- Polaris keeps design system components in sync, but does not house the "spiky internal opinions" about why the Admin works the way it does
- Internal Admin UX decisions are codified separately as an "Admin UX decision log"
- Navigation changes are editorial decisions requiring review by the Operate team and ultimately Tobi
- The nav is designed to "tell the story of Shopify and not expose our org chart"

---

## 2. Navigation Philosophy: The L-Shaped Frame

**Source:** [Admin Navigation](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19870-A-dmin-navigation)

### The L-Shape

The Admin is framed by its primary navigation: the **left sidebar** and **topbar**, plus the area beneath the topbar containing page title and primary actions. This forms an **L-shape** (turned on its side) that is the frame for most Admin workflows.

### Protecting the L

| Principle | Detail |
|---|---|
| **Always visible** | The L should always be visible, except when moving into a specialized layer (e.g., Online Store Editor) |
| **No experiments** | Navigation should be stable and consistent -- Shopify does not run experiments in the nav |
| **Editorial control** | What appears in the nav is an editorial decision made by Tobi as "editor-in-chief of the Admin" |
| **Spatial memory** | The page title and primary actions are part of wayfinding UX -- merchants can scroll them away, but they signal where the merchant is and what they can do |

### Top Navigation Bar

Houses global utilities for orientation and cross-ecosystem navigation:

| Element | Purpose |
|---|---|
| **Shopify logo** | Orients merchants; click to return to Home; identifies current Edition |
| **Search / Command-K** | Locates specific items; alternate navigation entry point; ensures no dead ends |
| **Persistent setup guide** | Guides new merchants through Admin setup |
| **Sidekick** | AI-based support for merchants to GSD |
| **Admin alerts** | Business-critical messages from Shopify |
| **Store switcher / Account menu** | Navigate multiple stores, organizations, account settings |

### Left Navigation Sidebar

Tells merchants "what matters most to Shopify":

- **Core features** essential to running a store (Orders, Products, Customers)
- **Sales channels** section (apps with special privileges for selling)
- **Apps** section (added via Shopify App Store)
- **Settings** at bottom left

### Key Navigation Rules

1. The left nav drives feature discovery, but merchants also discover features organically through workflows and flexible indexes
2. Sub-navigation is used for many left nav items; apps can surface sub-nav once pinned
3. Settings does NOT use sub-navigation (with rare exceptions)
4. Staff members can pin sales channels and apps for user-level customization
5. Online Store and POS are pre-installed and pre-pinned (as of June 2023)

---

## 3. Wayfinding & Navigation Pillars

**Source:** [Wayfinding](https://vault.shopify.io/teams/2075-Workflows/docs/1537)

Wayfinding has three major pillars:

### Three Pillars

| Pillar | Definition |
|---|---|
| **Orientation** | The merchant has a strong sense of where they are and what is possible within the Admin. Navigation gives merchants a strong sense of system architecture and how their business maps to Shopify. |
| **Findability** | The merchant can find an efficient route to their destination, even if the destination is unknown. Navigation optimizes for browsing; Search optimizes for known-item seeking with speed. |
| **Learnability** | The merchant can accumulate wayfinding experience within the Admin which makes them more productive over time. |

### Wayfinding Outcomes

| Outcome | Metric Connection |
|---|---|
| **Launch** | Users find functionality needed to launch their store; increases confidence and resiliency. Impact: merchants reaching 5 sales in 60 days. |
| **Grow** | More efficient setup & running leads to merchants quitting their job. Measured by GMV growth. |
| **Don't Outgrow** | Advanced users stay as powerful as possible; more time on productive tasks. Contributes to lower millionaire churn rate. |

> "As Shopify grows in features and complexity, wayfinding must constantly adapt to ensure the three pillars are always met. This will ensure that Shopify always wins at ease of use."

---

## 4. Admin Home Strategy: Merchant Hierarchy of Needs

**Source:** [Admin Home](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Communications/Growth-Systems/Admin-Home)

### Purpose

Home is the first thing merchants see when they log into Shopify. It is an at-a-glance summary of their business, and a place to learn about the next steps they can take. The purpose of Home is to **guide merchants towards the best actions they can take to grow their business**.

### Three Primary Functions

1. **Store at a glance** -- quick pulse on business performance
2. **Continuous guidance** -- opinionated recommendations for growth
3. **Recognition / Celebration** -- milestone acknowledgment

### Merchant Hierarchy of Needs (Content Types)

Listed in priority order, reflecting the merchant's hierarchy of needs:

| Layer | Content Type | Description |
|---|---|---|
| **Store Pulse** | Metrics | Data widgets for quick business performance check. Total sales + funnel (sessions > carts > orders). |
| **Operations** | Order Tasks | At-a-glance summary of familiar order tasks and how many to complete. Orders are the common denominator routine task. |
| **Guidance** | Guides | Collections of tasks to achieve high-level outcomes (increase sales, improve conversion). |
| **Intelligence** | Actionable Insights | Data-driven information about the store with recommended next steps. |
| **Growth** | Home Cards | Direct actions merchants can take today to grow their business. |
| **Celebration** | Celebrations | In-the-moment recognition of important milestones (100K orders, 5-year anniversary, etc.). |
| **Rare** | Announcements | Restricted to ~3x/year max (BFCM, Editions). Requires Merchant Guidance team approval. |

### Home Principles

1. **Focus without distraction** -- Make guidance obvious for those who need it, easily avoidable for those who don't. Don't pull merchants away from important tasks.
2. **Less is more** -- Be opinionated about how merchants can achieve goals without forcing it.
3. **Never force a singular pathway** -- Merchants should be free to start, stop, and pick up tasks on any device.
4. **Only add value, never erode trust** -- Use data to inform what and when content is presented.

### Home Content Guidelines

| Show on Home | Do NOT Show on Home |
|---|---|
| Guidance that moves a top or bottom line metric | Workflow enhancement features that don't affect metrics |
| Actions that help reach high-level business objectives | Informational content that doesn't help grow business |
| Opportunities that immediately benefit a specific store segment (data-driven) | Actions not relevant to the merchant or their business |
| Content fitting Merchant Alert Guidelines | Plus features shown to non-Plus merchants |

---

## 5. Flexible Indexes Pattern

**Source:** [Flexible Indexes](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19872-F-lexible-indexes)

### Core Concept

The **index-to-detailed-view system** is integral to the Shopify Admin. Core primitives -- **Customers, Orders, Products, and Content** -- are organized into large indexes that allow for complex sorting and retrieval of instances.

### Principles for Index Views

| Principle | Detail |
|---|---|
| **Balance index with left nav** | Most sub-categories should be exposed through the index > detail view pattern rather than adding nav items. Only high-level categories go in the left nav. |
| **Use filters and sorting, avoid fixed groups** | Filtering and saved views let merchants view the data that matters to them. Custom views > fixed sub-navigation. Default sorting should match what merchants want most of the time. |
| **Minimize multi-level nesting** | Flatter structures are quicker to navigate and generally easier to understand. |
| **Organize by attributes, not hierarchy** | Non-hierarchical (tag-like) organization is better because objects naturally live in multiple categories. One product can be in multiple collections. |

### Two Organizational Approaches

| Approach | Analogy | Shopify Preference |
|---|---|---|
| **Hierarchical** | File system -- a file can only be in one folder | Not preferred |
| **Non-hierarchical** | Tags -- each object can have many tags | **Preferred** -- provides more flexibility |

> "Non-hierarchical organizations are better for our Admin because our objects often naturally live in multiple categories."

---

## 6. Admin Productivity Loop

**Source:** [Workflows](https://vault.shopify.io/teams/921-Admin/docs/11843-Operate-Data/11848-Work-Streams/11849-Workflows) | [Workflows Team](https://vault.shopify.io/teams/2075-Workflows/docs)

### The Loop

The Admin's productivity loop consists of three interconnected dimensions:

```
Communications (What) --> Operations (How) --> Wayfinding (Where)
         ^                                           |
         |___________________________________________|
```

| Dimension | Question | Responsibility |
|---|---|---|
| **Communications** | What needs to be done? | Notifications, alerts, home cards -- making merchants aware of what requires attention |
| **Operations** | How do I do it? | APIs, tools for managing commerce data, reusable UI widgets/components across JTBDs |
| **Wayfinding** | Where do I go? | Navigation, search -- ensuring merchants can find their destination efficiently |

### Workflows Team Mission

> "As a merchant, help me be highly productive using Shopify across my many commerce jobs-to-be-done."

The Workflows team ensures the Admin is:
- **Easy to use** -- approachable for new merchants
- **Powerful** -- capable for advanced merchants
- **Fast** -- providing aggregate workflows across commerce objects

They own: navigation, notifications, settings-section, store-activity, and workflows in both core and web.

---

## 7. Admin Communications System

**Source:** [Admin Communications](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Communications)

> "The admin is where merchants go to take care of business. To increase merchant success, it's important to communicate the right message, in the right system, at the right time."

### Four Communication Systems

| System | Purpose | Message Types | Patterns |
|---|---|---|---|
| **Growth** | Provide business info with recommendations on what to do next. Content is always relevant to the specific merchant. | Growth opportunities, Incentives, Upsells/cross-sells | Actionable insights, Guides & tasks, Home cards |
| **Learning & Discovery** | Educate merchants and help them find information they may not have found on their own. Typically informational. | Product discovery, Education | Feature test drives, Discover more from Shopify, Contextual guidance |
| **Celebration** | Recognize progress or success. More enthusiastic and playful. Creates joyous moments. | Milestones | Home cards |
| **Operations** | Provide visibility into store status including disruptions, confirmations, errors. Critical or time-sensitive. | Confirmations, Disruptions, Errors | Merchant notification platform, Merchant alerts, Push notifications, Error messages, Banners, Badges, Toasts, Emails |

---

## 8. Polaris Design System

**Source:** [Design Systems & Content Design](https://vault.shopify.io/docs/craft/45-UX-Handbook/Subdiscipline%20resources/Writing/20154-D-oing-Content-Design/6121-Design-Systems---Content-Design) | [Polaris Team](https://vault.shopify.io/teams/13943-Polaris/docs) | [polaris.shopify.com](https://polaris.shopify.com)

### What is a Design System?

> "Guidelines, best practices, processes, people, and tools that empower teams to design and build familiar experiences at scale for Shopify."

Polaris is the design system for the Shopify Admin -- one of Shopify's most valuable merchant tools. It contains content guidelines, design principles, reusable components, and more.

### Philosophy

- Design systems help **scale decision making and expertise**
- If everyone on a team utilizes and evolves the system, experiences have **quality and familiarity** -- they "feel like Shopify"
- Polaris is **public-facing** and keeps design system components in sync
- But it does NOT house the "spiky internal opinions" about Admin UX decisions (those live in the internal Admin Design docs)

### Design Language Elements

Polaris encompasses a complete design language:

| Visual | Verbal |
|---|---|
| Color | Voice and tone |
| Typography | Grammar and mechanics |
| Spacing | |
| Shape | |
| Shadow | |
| Illustration | |
| Motion | |
| Photography and videography | |
| Icons | |

### Key Polaris Architectural Patterns

| Pattern | Description |
|---|---|
| **Page layouts** | Standard layout structures for Admin pages |
| **Index tables** | Core component for flexible index views (Products, Orders, Customers) |
| **Index filters** | Filtering and saved views for index tables |
| **Cards** | Primary container for grouping related content |
| **Resource lists** | Lists of resources with consistent interaction patterns |
| **Navigation** | Sidebar and topbar navigation components |
| **Modals / Sheets** | Overlay patterns for focused tasks |
| **Forms** | Input patterns with validation |
| **Data visualization** | Polaris Viz library for charts and graphs |

### Polaris vs. Internal Admin Opinions

| Polaris (Public) | Admin Design (Internal) |
|---|---|
| Component library and guidelines | Why the admin works the way it does |
| Design tokens and patterns | Opinionated decisions about using components |
| Content and accessibility standards | Navigation editorial decisions |
| Applicable to 1P and 3P developers | Applicable to internal Shopify designers |

---

## 9. Voice & Tone Guidelines

**Source:** [Admin Home Voice & Tone](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Communications/Growth-Systems/Admin-Home) | [Polaris Content Guidelines](https://polaris.shopify.com/content/voice-and-tone)

### Polaris Voice Principles

| Principle | Detail |
|---|---|
| **Plain language** | Use contractions ("don't" not "do not"). Sound conversational, not formal. |
| **7th grade reading level** | Accessible to the widest possible merchant audience. |
| **Merchant-appropriate jargon** | Use terminology actual users employ, not corporate speak. |
| **Action-oriented** | Start sentences with verbs. Clear, directional guidance. |
| **Minimalist** | Remove unnecessary words and punctuation. Ask if each element is essential. |
| **Human test** | "Read it out loud. Does it sound like something a human would say?" |

### Admin Home Voice & Tone

Everything on Home should feel like it's coming from a **trusted business coach** whose job is to share clear, accurate, and relevant information.

If Home were a person: **conversational and friendly** -- someone merchants enjoy hearing from. Knowledgeable, but always uses **accessible, easy-to-understand language**.

### Tone Adaptation by Context

| Context | Tone | Description |
|---|---|---|
| **Metrics and tasks** | Objective, calm | Straight-to-the-point and crisp. Let data speak. Fewest words. Lean into data viz. |
| **Guides and insights** | Grounded, sensible | Clear and confident. Most data-informed, most opinionated. Careful not to over-promise. |
| **Promotional content** | Empowering, never pushy | Expressive storytelling. Inspires merchants to try something new. |
| **Celebrations** | Upbeat, sincere | Puts merchant's achievement in the spotlight. Recognition for hard work. |

### Tobi's Content Philosophy

> "We talk and write up to them, not down. We take away as much complexity as we possibly can. We make the remaining complexity as easy as possible to deal with. We teach them when needed. We don't infantilize them, we don't patronize them, we give them the tools they need to reach their potential."

---

## 10. Settings Design Principles

**Source:** [Designing the Admin](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin) | [Settings React Components](https://vault.shopify.io/docs/shopify-platform-and-product/Settings/ReactComponents) | [Admin Navigation](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19870-A-dmin-navigation)

### Core Settings Philosophy

Settings is found at the bottom left of the left navigation and is designed to be **focused**: one page per subject in the Settings navigation bar.

### Settings Navigation Rules

| Rule | Detail |
|---|---|
| **No sub-navigation** | Settings does not use sub-navigation, with rare exceptions |
| **One page per subject** | Each Settings section focuses on a single topic |
| **Exceptions for index tables** | Pages like Users that use an index table; Roles as substantial subpages |
| **Exceptions for standalone topics** | Pages like Security that merit their own page |
| **Changes require review** | Any Settings sub-nav changes need review by the Operate team, potentially Tobi |

### Settings System Building Blocks

The Settings experience is codified into a dedicated component library (living within `shopify/web` until Polaris Patterns package is available):

| Component | Purpose |
|---|---|
| **SettingsCard** | Foundational building block with header, content, and footer |
| **SettingsCardStack** | Organizational component for stacking and spacing cards |
| **SettingsEmptyContainer** | Empty state container within a card |
| **SettingsList / SettingsItem** | List-based content within cards |
| **SettingsTable** | Abstraction of IndexTable, IndexFilters, and Pagination with Settings aesthetic |
| **Toggle** | Binary input for enabling configuration |

### Settings Design Intent

Settings is about **configuration, not workflow**. It should:
- Avoid sprawling options
- Focus merchants on one subject at a time
- Use consistent patterns across all settings pages
- Provide clear cause-and-effect relationships between toggles/inputs and outcomes

---

## 11. Mobile Admin Principles

**Source:** [Admin Experience (Mobile)](https://vault.shopify.io/teams/3026-Mobile/docs/263) | [Admin Design - Designing for Shopify Mobile](https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design)

### Current State

- "Mobile-only" is on the rise: **30%+ of users** in core markets, **up to 70%** in international markets like India
- Desktop web will likely never "go away," but mobile usage will overtake desktop over time
- Today, the Shopify mobile app is used primarily as a **companion to desktop**
- Most users switch to desktop very early in the signup experience due to friction

### Mobile Vision

> "To make commerce better for everyone, the full Shopify experience needs to be accessible to all merchants on any of the platforms they need to get their work done."

### Mobile Principles

| Principle | Detail |
|---|---|
| **Platform parity** | Merchants should achieve the same outcomes on all primary platforms |
| **Leverage unique capabilities** | Use platform and device capabilities (touch, camera, notifications) |
| **Build for all devices** | Make it easy for teams at Shopify to build for all devices |
| **Shared quality bar** | Build shared understanding of philosophy and quality |
| **First-class mobile-only** | Re-build areas that are high friction or force desktop switching |

### Mobile Design Areas (from Admin Design)

The internal Designing for Shopify Mobile documentation covers:
- Overall approach to mobile design
- How to design content for mobile screens
- IA and navigation for mobile
- Why progressive disclosure is leveraged on mobile

---

## 12. Core Product Principles (Tobi's Memo)

**Source:** [Store Management (Core) Principles](https://vault.shopify.io/docs/get-to-know-shopify/Get-to-know-Tobi/16924-Memos-from-Tobi-Lutke/Store%20Management%20Core%20Principles)

Written by Tobias Lutke in June 2020 after taking over the Store Management product line. These are the foundational principles for the Admin.

### Why It Matters

> "We arm the rebels against Amazon's empire. Store Management is what we arm them with. It's the operating system for the future of the retail industry."

### Who It's For

> "Our target audience is smart, ambitious, ready-to-learn entrepreneurs and entrepreneurial people within larger companies. The prototypical Shopify customer builds the current (and next!) Allbirds, KOTN, Kylie, Hiut, and Vaute. We do not build software that fits the needs of all merchants. We power the merchants that other merchants aspire to be."

### The Principles

| # | Principle | Key Quote |
|---|---|---|
| 1 | **We are merchant obsessed** | "Does solving this problem lead to exclamations of 'hell yes!' when we launch? If not, it's unlikely that we should be working on it." |
| 2 | **Adding a new feature makes our product worse** | "Features are not valuable from a UX perspective unless they are used. We default to no new features." |
| 3 | **Build what most people need most of the time** | "Features go into Shopify Core Admin only when most merchants would use it most of the time. For everything else, there is the App Store." |
| 4 | **We sweat the details** | "Most of a product's success comes from the how. Execution matters more than anything else." |
| 5 | **Listen to problems, not solutions** | "Our merchants tell us getting a payment gateway is hard. They would not ask us to build SFN, but we did so to solve their shipping problems." |
| 6 | **Move fast via existing infrastructure** | Three types of work: Experiments (hypothesis + throw away code), Features (built fast on stable infra), Infrastructure (carefully designed, takes years). |

### The "Default to No" Philosophy

> "We celebrate making our existing features deeper without making them harder to use. We need all existing features to be better, more scalable, more approachable, more international, and faster."

### The Windows Analogy

> "Windows ships without Office, even though people want Office. That doesn't make Windows less valuable as a platform because it doesn't ship with everything out of the box. In fact, it makes it even more valuable because you need Windows to get Office."

### Experiments / Features / Infrastructure Framework

| Type | Approach |
|---|---|
| **Experiment** | Have a hypothesis. Throw the code away after. Output is a decision. |
| **Feature** | Built quickly because supported by great infrastructure. Iterate based on merchant feedback. Pareto principle: 80% value through 20% work before launch. "That's not an MVP. Don't build MVPs." |
| **Infrastructure** | Fuel of all future potential. Carefully designed, often takes years. Anticipate needs three years down the road. |

---

## Source References

| Topic | Vault URL |
|---|---|
| Admin Design (Overview) | https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design |
| Designing the Admin | https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin |
| Admin Navigation | https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19870-A-dmin-navigation |
| Flexible Indexes | https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Design/19480-Designing-the-admin/19872-F-lexible-indexes |
| Wayfinding | https://vault.shopify.io/teams/2075-Workflows/docs/1537 |
| Workflows Team | https://vault.shopify.io/teams/2075-Workflows/docs |
| Admin Home | https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Communications/Growth-Systems/Admin-Home |
| Admin Communications | https://vault.shopify.io/docs/shopify-platform-and-product/7318-Admin/Admin-Communications |
| Admin Productivity Loop | https://vault.shopify.io/teams/921-Admin/docs/11843-Operate-Data/11848-Work-Streams/11849-Workflows |
| Polaris Team | https://vault.shopify.io/teams/13943-Polaris/docs |
| Design Systems & Content Design | https://vault.shopify.io/docs/craft/45-UX-Handbook/Subdiscipline%20resources/Writing/20154-D-oing-Content-Design/6121-Design-Systems---Content-Design |
| Settings React Components | https://vault.shopify.io/docs/shopify-platform-and-product/Settings/ReactComponents |
| Mobile Admin Experience | https://vault.shopify.io/teams/3026-Mobile/docs/263 |
| Tobi's Core Principles | https://vault.shopify.io/docs/get-to-know-shopify/Get-to-know-Tobi/16924-Memos-from-Tobi-Lutke/Store%20Management%20Core%20Principles |
| Polaris Voice & Tone | https://polaris.shopify.com/content/voice-and-tone |
| Shopify Admin Product | https://vault.shopify.io/products/111-shopify-admin |

---

*Last updated: 2026-02-05*
