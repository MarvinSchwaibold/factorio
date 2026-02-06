# Shopify Merchant Segments & Scale: A Comprehensive Reference

> **Purpose:** Context document for rethinking the Shopify Admin from first principles. Covers how Shopify categorizes merchants, how needs scale with complexity, where the platform breaks at scale, and how different merchant archetypes interact with the admin differently.
>
> **Audience:** Claude instance or human designer redesigning Admin experiences.

---

## Table of Contents

1. [Merchant Journey Segmentation (Internal Model)](#1-merchant-journey-segmentation-internal-model)
2. [Plan Tiers & Feature Gating](#2-plan-tiers--feature-gating)
3. [Commercial Segments (Revenue/Sales Model)](#3-commercial-segments-revenueSales-model)
4. [B2B vs. B2C vs. Retail/POS](#4-b2b-vs-b2c-vs-retailpos)
5. [Plus and Enterprise Features & Needs](#5-plus-and-enterprise-features--needs)
6. [Commerce Components (CCS) -- Headless/Composable](#6-commerce-components-ccs----headlesscomposable)
7. [Complexity Dimensions -- How Needs Scale](#7-complexity-dimensions----how-needs-scale)
8. [Scale Breakpoints -- Where the Admin Breaks](#8-scale-breakpoints----where-the-admin-breaks)
9. [Multi-Location, Multi-Market, Multi-Channel Complexity](#9-multi-location-multi-market-multi-channel-complexity)
10. [Merchant Hierarchy of Needs](#10-merchant-hierarchy-of-needs)
11. [Merchant Persona Archetypes](#11-merchant-persona-archetypes)
12. [Key Implications for Admin Design](#12-key-implications-for-admin-design)

---

## 1. Merchant Journey Segmentation (Internal Model)

Shopify's official internal segmentation model is the **Merchant Journey Segmentation**, built by the Merchant Intelligence team in partnership with Finance (project completed 2021, [GSD #16441](https://vault.shopify.io/projects/16441-Merchant-Segmentation)). It uses rules based on **engagement** (login days), **scale** (order volume), and **intentionality** (Plus status, dev shop referral, commerce background questionnaire).

| Segment | Description | Key Signals |
|---|---|---|
| **Pre-Commerce** | Beginning their journey, working towards selling, generating little to no orders | Low/no orders, some login activity, setup-phase signals |
| **Seller** | Selling at a small scale on Shopify | Small order volume, regular engagement |
| **Established** | Achieved higher scale, more likely self-sustaining businesses | Significant order volume, consistent engagement |
| **Mature** | Achieved the highest level of scale on Shopify | High order volume, deep platform usage, often Plus |
| **Non-Seller** | Has a subscription but is not actively working towards selling | Subscription active, minimal/no login or order activity |

### Design Principle
This is a **base segmentation layer** -- a shared language across commercial and product teams. It is explicitly designed to be extended with **dimensions** layered on top:
- Region / geography
- Industry / vertical
- Growth trajectory
- Complexity (product count, channel count, team size)
- Business model (DTC, B2B, retail, hybrid)

**Source:** [Merchant Journey Segmentation -- Vault Page](https://vault.shopify.io/teams/2327-Executive-Insights/docs/14477-Merchant-Journey-Segmentation)

---

## 2. Plan Tiers & Feature Gating

Shopify's plan structure determines which features merchants can access. Plans are the primary mechanism for feature gating.

| Plan | Monthly Price (USD) | Target Merchant | Key Differentiators |
|---|---|---|---|
| **Starter** | $5 | Social sellers, link-in-bio | No full online store; sell via links, social, messaging |
| **Basic** | $39 | New businesses, solo founders | Full online store, 2 staff accounts, basic reports |
| **Shopify (Standard)** | $105 | Growing businesses | 5 staff accounts, professional reports, better shipping rates |
| **Advanced** | $399 | Scaling businesses | 15 staff accounts, advanced reports, computed shipping rates, duties & import taxes |
| **Plus** | $2,300+ | High-volume, complex operations | Org-level management, Shopify Flow, Scripts, LaunchPad (deprecated), B2B, unlimited staff, checkout extensibility, 200 locations |
| **Enterprise (CCS)** | Custom pricing | $125M+ GMV enterprise retailers | Composable components, unthrottled APIs with SLAs, 40K checkout starts/min, own pod, customizable admin, 1000 locations |

### Feature Gating Patterns

Features are gated across several dimensions:

- **Staff accounts:** 2 (Basic) -> 5 (Standard) -> 15 (Advanced) -> Unlimited (Plus/Enterprise)
- **Locations:** 10 (Basic-Advanced) -> 200 (Plus) -> 1000 (Enterprise)
- **Reports:** Basic -> Professional -> Advanced -> Custom
- **B2B features:** Plus+ only (currently; moving downmarket in 2026 -- [GSD #48961](https://vault.shopify.io/projects/48961-B2B-Moving-B2B-Downmarket))
- **Checkout customization:** Plus+ only (Checkout Extensibility)
- **Automation (Flow):** Available on all plans now, but advanced actions gated
- **API rate limits:** Increase with plan tier; Enterprise gets unthrottled with SLA
- **Organizations:** Plus+ only (multi-store management)
- **RBAC:** Available for all merchants (shipped 2024), but more granular controls on Plus+

### Marketing Customer Segments (Revenue)

The Revenue/Commercial team uses these segments for go-to-market:

| Segment | Description |
|---|---|
| **Enterprise** | $125M+ annual GMV -- Plus/large organizations |
| **Large** | Large organizations, significant GMV |
| **Mid-Market** | $10M - $1B (includes some Plus merchants) |
| **Core / Standard** | Standard plan merchants |
| **Retail** | Retail-focused merchants |

**Source:** [Zip Segment Guide for Marketers](https://vault.shopify.io/docs/shopifolk-essentials/511-Finance---Procurement/771-The-Procurement-Pathway/2135-Zip-As-the-main-intake-service-in-the-pathway/zip-for-requesters/Zip-Segment-Guide-for-Marketers)

---

## 3. Commercial Segments (Revenue/Sales Model)

The Sales organization uses a different segmentation model optimized for go-to-market:

### Plus Merchant Segments (Historical)
- **Self-Drive:** Plus merchants who largely self-serve; lower touch
- **Dedicated:** Plus merchants with assigned MSMs (Merchant Success Managers)
- **Large Merchant:** Highest-GMV Plus merchants requiring enterprise-level support

Source: [B2B Merchant Segmentation Project](https://vault.shopify.io/projects/13376-B2B-Merchant-Segmentation), [Plus FED - Merchant Segments](https://vault.shopify.io/projects/18841-Plus-FED-Merchant-Segments)

### Capital/Lending Segments
- **Upmarket:** $1.75M+ GMV
- **Mid-Market (MM):** $5-40M GMV
- **Nano:** <$20K GMV

Source: [Capital Risk-Based Pricing Project](https://vault.shopify.io/projects/48468-Capital-Bring-risk-based-pricing-to-upmarket-and-nano-merchants)

### Enterprise 3.0 (2025-2026)
Enterprise is now a key growth driver. Since 2022, enterprise booked revenue has grown 80%+, targeting $1B+ in booked lifetime revenue by 2026. The GTM strategy includes three plays: **full stack, headless, and composable** -- meeting customers wherever they are in their lifecycle or tech stack complexity.

Source: [Q4 2024 Earnings Revenue Story](https://vault.shopify.io/posts/265265)

---

## 4. B2B vs. B2C vs. Retail/POS

Shopify serves three fundamentally different commerce models, each with distinct admin needs:

### B2C (Direct-to-Consumer) -- The Core
- **Primary use case:** Online store selling directly to end consumers
- **Admin focus:** Product management, marketing, storefront customization, order fulfillment
- **Channels:** Online store, social media, marketplaces, Shop app
- **Key features:** Themes, SEO, discount codes, email marketing, analytics

### B2B (Business-to-Business) -- Currently Plus-Gated
- **Primary use case:** Selling wholesale or to other businesses
- **Admin focus:** Company accounts, catalogs with custom pricing, net payment terms, draft orders, quantity rules
- **Key differences from B2C:**
  - Company > Customer hierarchy (companies have multiple locations, buyers)
  - Custom price lists per company/location
  - Net payment terms (Net 30, Net 60)
  - Quantity rules (minimums, maximums, increments)
  - Sales rep access controls (first-ever record-level access control)
  - Large/complex orders (500+ line items)
- **Current state:** Native B2B is Plus-only. 19K+ non-Plus merchants pay for 3P B2B apps (Sparklayer, Wholesale Gorilla), creating data silos
- **Coming 2026:** B2B moving downmarket to non-Plus plans with limits to preserve Plus differentiation

Source: [B2B Moving Downmarket](https://vault.shopify.io/projects/48961-B2B-Moving-B2B-Downmarket)

### Retail/POS -- Unified Commerce
- **Primary use case:** Physical retail locations with point-of-sale
- **Admin focus:** Location management, inventory by location, staff management, POS hardware
- **Key POS plans:**

| POS Plan | Price | Features |
|---|---|---|
| **POS Lite** | Free with any Shopify plan | Basic POS, limited staff, returns at original location only |
| **POS Pro** | $89/mo per location | Unlimited staff, roles & permissions, receipt customization, barcode support, advanced inventory (Stocky), purchase orders, supplier management |

- **Retail Activity Segments (Data Science):**

| Segment | Locations | Description |
|---|---|---|
| Inactive | 0 active | Not processing retail GMV |
| Small Retailer | 1-2 active | Independent retailers, small businesses |
| Mid-Market Emerging | 3-19 active | Growing retail, expanding physical presence |
| Mid-Market Mature | 20+ active | Established retail, complex multi-location needs |

- **Key retail pain points:**
  - Multi-location inventory management (still #1 challenge)
  - Staff management at scale (David's Bridal: 190 stores, high turnover)
  - BOPIS complexity (enabling pickup exposes all retail inventory to online buyers)
  - Purchase orders and supplier management
  - Cycle counts

Source: [Retail Data Science Glossary](https://vault.shopify.io/docs/shopify-platform-and-product/8061-Merchant-Services-Group/Retail/Glossary), [Retail Weekly Update W21](https://vault.shopify.io/posts/292573)

### Hybrid Commerce (The Growing Norm)
Most scaling merchants operate across multiple models simultaneously:
- DTC online + retail locations
- DTC + B2B from one admin
- DTC + retail + B2B + international

The Markets product is Shopify's answer to this, enabling all models from a single store.

---

## 5. Plus and Enterprise Features & Needs

### What Plus Merchants Get (Beyond Advanced)

| Category | Plus Feature |
|---|---|
| **Organization** | Multi-store management, SSO, org-level settings, unified billing |
| **Staff** | Unlimited staff accounts, RBAC with granular permissions |
| **Checkout** | Checkout extensibility (UI extensions, Functions), Scripts |
| **B2B** | Full native B2B (companies, catalogs, custom pricing, payment terms) |
| **Automation** | Shopify Flow (advanced), Launchpad (deprecated) |
| **Locations** | Up to 200 (extendable by request to 1000) |
| **Support** | Dedicated Plus support, MSM access for larger accounts |
| **Performance** | Higher API rate limits, priority infrastructure |
| **Theme** | Dawn-based themes with Plus-specific features |
| **Test Drive** | Feature test drives for staged rollouts |
| **Store Copy** | Clone stores for expansion (exporting 1.1M variants: 18hrs -> 30min) |

### What Enterprise Merchants Need (Beyond Plus)

Based on Vault research across support, sales, and product teams:

| Need | Description |
|---|---|
| **Customizable navigation** | Enterprise-specific admin navigation (shipped, working with ProServe to onboard) |
| **SLAs** | Platform reliability guarantees -- table stakes for enterprise but new for Shopify |
| **Unthrottled APIs** | Higher/unlimited API rate limits with contractual SLAs |
| **Multi-entity** | Multiple business entities (legal entities) from one organization |
| **Advanced permissions** | Record-level access controls (e.g., sales reps see only their accounts) |
| **Integration support** | ERP integration (SAP, NetSuite), OMS, PIM connectivity |
| **Migration services** | Professional services for platform migration, data migration |
| **Scale performance** | 40K checkout starts/minute, handling flash sales |
| **Composable architecture** | Ability to use Shopify components in existing tech stack |
| **Technical account management** | Dedicated TAMs, technical support experts |

### The Plus/Enterprise Narrative Shift
As Craig (former EVP Product) stated: **"It isn't about Shopify getting more complex, it's about taking on more of our merchants' complexity."** The focus shifted from building for generalist small business owners who want simplicity to specialist users who want agency and mastery tools.

Source: [Solving for Scale -- Katie Cerar & Hana Abaza, Summit 2019](https://vault.shopify.io/tv/series/12-Summit/episodes/176-Katie-Cerar-Hana-Abaza-Solving-for-Scale)

Key quote from that talk: **"As experts, we don't necessarily want simplicity, we want agency. The ability to master our craft."**

---

## 6. Commerce Components (CCS) -- Headless/Composable

### What It Is
Commerce Components by Shopify (CCS) is a **modular packaging of Shopify's infrastructure, APIs, services, and support** designed for enterprise retailers ($125M+ GMV). Launched January 3, 2023.

It is NOT a separate product -- it's a **way to partner with the biggest enterprises** and build with their existing technology stack using Shopify components.

### Why It Exists
- Large enterprise retailers did not consider Shopify viable for their commerce needs
- Marketing had not kept pace with product evolution
- Need to compete with Salesforce Commerce Cloud, commercetools, etc.
- Shop Pay Commerce Component serves as a **compelling entry point** into the Shopify ecosystem

### CCS Differentiating Features

| Feature | CCS | Plus |
|---|---|---|
| Checkout starts/minute | 40,000 | 4,200 (default) |
| API rate limits | Unthrottled with SLA | Standard throttled |
| Infrastructure | Own/separate pod | Shared |
| Admin | Customizable | Standard |
| Support | Enhanced + TAM | Plus support |
| Locations | Up to 1,000 (300 POS Pro + 1,000 omni-channel) | Up to 200 |
| Shop Pay Component | Yes (standalone, off-Shopify) | No |

### Enterprise Architecture Preferences (IDC Research, 2024)
- **47%** describe their architecture as composable frontend / full-stack backend (hybrid)
- **27%** have fully headless and modular
- **26%** have all-in-one solution
- **~2/3** considering upgrading their commerce architecture in the next 3 years

Main advantages of composable + full-stack:
1. Improved customer experience (38%)
2. Cost effectiveness (35%)
3. Faster time to market (31%)

### GTM Strategy
Three plays: **full stack, headless, composable**. This flexibility lets Shopify meet customers wherever they are in their lifecycle or tech stack complexity.

"Shopify for Enterprise" is a packaged offering of products, features & services designed to suit the typical needs of an enterprise business. It is distinct from Shopify's internal segmentation of enterprise merchants (>$125M annual GMV).

Source: [Commerce Components Overview](https://vault.shopify.io/docs/shopify-platform-and-product/Commerce-Components), [CCS Vault Page](https://vault.shopify.io/docs/shopify-platform-and-product/Commerce-Components/commerce-components-overview), [Enterprise Revenue Story](https://vault.shopify.io/posts/265265)

---

## 7. Complexity Dimensions -- How Needs Scale

The Merchant Journey Segmentation was designed to support a **complexity dimension** as an additional lens. Deliver (Core Back Office) also built a **Back Office Tiers & Personas** framework. Here is a synthesis of how needs scale across key dimensions:

### Order Volume

| Scale | Orders/day | Admin Needs | Pain Points |
|---|---|---|---|
| **Micro** | 0-5 | Simple order list, manual fulfillment | None -- admin works great |
| **Small** | 5-50 | Basic filtering, bulk actions | Starting to need automation |
| **Medium** | 50-500 | Saved views, bulk fulfillment, automation (Flow) | Order list gets unwieldy, need filtered views |
| **High** | 500-5,000 | Advanced filtering, order routing, 3PL integration | Admin pages slow to load, need OMS-like features |
| **Enterprise** | 5,000+ | API-driven workflows, custom OMS, ERP integration | Admin becomes secondary to API/integration workflows |

### Product Catalog Size

| Scale | Products | Admin Needs | Pain Points |
|---|---|---|---|
| **Tiny** | 1-50 | Simple product list | None |
| **Small** | 50-500 | Search, categories, basic bulk editing | None |
| **Medium** | 500-5,000 | Collections, saved views, bulk editor, CSV import/export | Bulk operations slow down |
| **Large** | 5,000-50,000 | Advanced search, automated collections, bulk operations | Product pages load slowly, variant management painful |
| **Massive** | 50,000+ | API-driven product management, PIM integration | Admin essentially unusable for product browsing; rely on external tools |

Key variant scaling: Shopify increased from 100 to 2,000 variants per product (GA targeting H1 2025). At 2K variants, API performance required significant optimization -- `productVariantsBulkCreate` needed ActiveRecord improvements (~800ms improvement at 2K variants).

Source: [Products Initiatives Update Nov 2024](https://vault.shopify.io/posts/245732)

### Team Size

| Scale | Staff | Admin Needs | Pain Points |
|---|---|---|---|
| **Solo** | 1 | Full admin access, simplicity | None |
| **Small** | 2-5 | Basic roles (Basic/Standard plan limits) | Limited staff accounts on lower plans |
| **Medium** | 5-15 | RBAC, defined roles, activity logs | Need granular permissions |
| **Large** | 15-100 | Organization-level management, SSO, per-team permissions | Require Plus for adequate staff management |
| **Enterprise** | 100+ | Bulk staff management, API-driven user provisioning, multi-entity | Admin staff management doesn't scale; David's Bridal with 190 stores needed bulk APIs |

### Channel Count

| Scale | Channels | Admin Needs | Pain Points |
|---|---|---|---|
| **Single** | Online store only | Default admin | None |
| **Multi** | 2-3 (online + social or POS) | Channel selector, product publishing per channel | Manageable |
| **Omni** | 4+ (online + POS + marketplace + B2B) | Unified order management, cross-channel inventory, Markets | Inventory allocation, channel conflicts, attribution |
| **Complex** | 10+ | API-driven channel management, custom integrations | Admin overview pages insufficient; need custom dashboards |

### Market Count (International)

| Scale | Markets | Admin Needs | Pain Points |
|---|---|---|---|
| **Domestic** | 1 | Default everything | None |
| **Early intl** | 2-3 | Markets setup, multi-currency, basic localization | Translation management |
| **Global** | 4-10 | Managed Markets, market-specific catalogs, pricing, themes | Complexity of duties/taxes, regulatory compliance |
| **Enterprise global** | 10+ | Multi-entity (legal entities per country), ERP integration, compliance | Admin cannot manage all variations; rely on automation + external tools |

---

## 8. Scale Breakpoints -- Where the Admin Breaks

Based on specific findings from Vault research:

### Known Breaking Points

| Dimension | Threshold | What Breaks | Source |
|---|---|---|---|
| **Order badges** | 10,000+ | Order count badges cap at 10,000 | [Solving for Scale Summit 2019](https://vault.shopify.io/tv/series/12-Summit/episodes/176) |
| **Large data sets** | Variable | Pages don't load with large data sets | [Solving for Scale Summit 2019](https://vault.shopify.io/tv/series/12-Summit/episodes/176) |
| **Locations** | 250+ | Degraded Admin experience; many variants x many locations = slow | [Location Limit Requests](https://vault.shopify.io/teams/126-Inventory/docs/18427-Inventory-Engineering/1467-Inventory-ATC/8610-Location-limit-Requests) |
| **Variants per product** | 100 (old) / 2,000 (new) | Product pages, bulk editor, POS, mobile admin all affected | [Products Initiatives Nov 2024](https://vault.shopify.io/posts/245732) |
| **CSV import** | 20MB+ | Import infrastructure not built for massive scale | [B2B Pricing Import](https://vault.shopify.io/posts/119402) |
| **B2B order line items** | 500+ | 28 GitHub issues filed across Orders, Inventory, Checkout, Fulfillment, Draft Orders, Shipping | [Large/Complex Orders Project](https://vault.shopify.io/posts/171462) |
| **Company locations (B2B)** | 500 (old) / 10,000 (new) | Blocker for large B2B merchants | [B2B Foundations](https://vault.shopify.io/posts/211696) |
| **Staff per store** | 100+ retail staff | No bulk management APIs; high-turnover retail needs programmatic user provisioning | [David's Bridal Escalation](https://vault.shopify.io/posts/297473) |
| **Flash sales** | 600+ orders/min for 90+ sec | Inventory sync issues, overselling with multi-location | [Location Limit Requests](https://vault.shopify.io/teams/126-Inventory/docs/18427-Inventory-Engineering/1467-Inventory-ATC/8610-Location-limit-Requests) |
| **Stores per organization** | 5+ | New store setup: 24-48 hrs BizOps, 44+ staff members manually, 20+ apps installed, up to a week for data migration | [Solving for Scale Summit 2019](https://vault.shopify.io/tv/series/12-Summit/episodes/176) |

### UX Breaking Points (B2B Large Orders)
Identified but not yet addressed (from the Large/Complex Orders investigation):
- Lack of pagination on order detail pages
- Missing "Select all" button for bulk operations
- Slow page loads due to how much information Web requests at once
- No lazy loading for order line items

Source: [Enabling Large/Complex Orders](https://vault.shopify.io/posts/171462)

### The Two-Mode Problem
Merchants above certain thresholds effectively operate in a **different mode** than the admin was designed for:
- They manage through **APIs and integrations** rather than the admin UI
- They use **external tools** (PIM, OMS, ERP) as their system of record
- The admin becomes a **monitoring/exception-handling tool** rather than the primary workspace

As the Deliver team noted: "More and more merchants are turning to external products to be the central hub for their business."

---

## 9. Multi-Location, Multi-Market, Multi-Channel Complexity

### Multi-Location Inventory
- **History:** Multi-location launched ~2016-2017, transforming how products, orders, shipping, taxes, and POS work across the platform
- **Current limits:** 10 locations (Basic-Advanced), 200 (Plus), 1,000 (Enterprise/CCS)
- **Key insight:** 50% of Shopify orders were being fulfilled outside the platform before multi-location launched
- **Current challenges:**
  - BOPIS: Enabling pickup at a retail location exposes ALL retail inventory to online buyers
  - Safety stock for online creates overselling at POS
  - Transfer management between locations (just shipped with barcode scanning, 90% scan success rate)
  - Purchase orders and supplier management still being built

Source: [Multi-Location Town Hall 2016](https://vault.shopify.io/tv/series/1-Shopify-Town-Hall/episodes/721)

### Multi-Market (International)
Shopify Markets is the unified surface for managing international expansion:

- **Markets:** Create market-specific catalogs, pricing, themes, and experiences
- **Managed Markets (Markets Pro):** Merchant-of-record solution -- Shopify handles duties, taxes, currency, fraud
- **Key capability:** 130+ local currencies, geolocation, local payment methods
- **Graph view:** Merchants can visualize their entire business structure (markets, channels, locations)
- **Hierarchy:** Nested markets (retail and B2B under broader regional markets) with automatic inheritance

**The "PhD in Shopify" Problem:** As Rohit Mishra stated at Summit 2024: "If you have a PhD in Shopify, anything is possible. But possible wasn't good enough." Markets aims to make multi-market management intuitive rather than requiring deep platform expertise.

Source: [Markets Summit 2024](https://vault.shopify.io/tv/series/12-Summit/episodes/118-Rohit-Mishra-A-central-home-for-Markets), [Markets Pro Editions](https://vault.shopify.io/tv/series/15-Editions/episodes/779-Introducing-Markets-Pro)

### Multi-Channel
- Online Store (Liquid themes or Hydrogen headless)
- POS (retail locations)
- Social channels (Facebook, Instagram, TikTok Shop)
- Marketplaces (Amazon, eBay, Google Shopping)
- B2B (wholesale channel, now native)
- Shop app
- Custom channels (via API)

**Current friction:** Previously, merchants created SEPARATE Shopify stores for each channel/market. Markets is eliminating this by enabling everything from a single store. The old pattern of "merchant expanding -> create new store -> manage multiple stores" is being replaced by "merchant expanding -> add a market."

---

## 10. Merchant Hierarchy of Needs

Synthesized from multiple Vault sources, here is a hierarchy of merchant needs that maps roughly to their journey stage:

### Level 1: Survival (Pre-Commerce / Early Seller)
- Get a store online
- Add products
- Accept payments
- Make first sale
- **Admin need:** Simplicity, guided setup, onboarding

### Level 2: Growth (Seller / Early Established)
- Get more traffic (SEO, social, ads)
- Convert visitors to buyers
- Manage increasing orders
- Understand basic analytics
- **Admin need:** Marketing tools, basic analytics, order management

### Level 3: Operations (Established)
- Automate repetitive tasks
- Manage inventory across locations
- Handle returns and exchanges efficiently
- Team management with roles
- **Admin need:** Automation (Flow), multi-location, staff permissions, bulk operations

### Level 4: Scale (Late Established / Early Mature)
- Expand to new channels (retail, marketplaces, B2B)
- Sell internationally
- Integrate with ERP/OMS
- Advanced analytics and reporting
- **Admin need:** Markets, channel management, API integrations, advanced reporting

### Level 5: Optimization (Mature / Enterprise)
- A/B testing and experimentation
- Custom checkout experiences
- Performance optimization
- Data-driven merchandising
- **Admin need:** Checkout extensibility, experimentation framework, custom dashboards

### Level 6: Enterprise Mastery (Enterprise / CCS)
- Composable architecture
- Multi-entity/multi-brand management
- SLA-backed infrastructure
- Custom admin experiences
- **Admin need:** API-first workflows, customizable admin, dedicated infrastructure

**Key insight from Retail POS team:** "I think of it like the hierarchy of needs. Our top priorities are basics and unified. Once those are excellent, then what will merchants think about? They will think about 'How can I stand out? What makes my in-store experience special? I don't want to be like everyone else.'"

Source: [Helen Mou, W26 Retail Update](https://vault.shopify.io/posts/297473)

---

## 11. Merchant Persona Archetypes

Synthesized from Vault research across multiple teams:

### By Business Stage

| Archetype | Description | Admin Relationship |
|---|---|---|
| **The Dreamer** | Pre-commerce, exploring ideas, not yet selling | Needs guided onboarding, templates, inspiration |
| **The Hustler** | Solo founder, first sales, learning everything | Lives in admin daily, needs simplicity and quick actions |
| **The Operator** | Growing team, systematizing processes | Needs automation, delegation, bulk operations |
| **The Strategist** | Multi-channel, scaling, data-driven decisions | Needs analytics, integrations, market expansion tools |
| **The Executive** | Enterprise, delegates operations, focuses on strategy | Rarely in admin; team uses it; needs dashboards and oversight |

### By Business Model

| Archetype | Description | Unique Admin Needs |
|---|---|---|
| **DTC Brand** | Online-first, brand-focused, direct relationship with consumers | Theme customization, marketing, content, customer data |
| **Brick & Mortar Retailer** | Physical-first, adding digital | POS management, location inventory, staff scheduling |
| **B2B Wholesaler** | Selling to other businesses | Company accounts, custom pricing, net terms, sales rep tools |
| **Omnichannel Brand** | Selling everywhere -- online, retail, wholesale, marketplace | Unified inventory, cross-channel orders, Markets |
| **Dropshipper / Print-on-Demand** | No inventory, supplier-fulfilled | Product sourcing, supplier management, margin tracking |
| **Creator / Side Hustler** | Social-first, link-in-bio, low complexity | Minimal admin; mostly mobile; needs fast product listing |

### By Operational Complexity (Deliver's Back Office Tiers)

The Deliver team built a tier-based segmentation for back office needs:

| Tier | Description | System of Work |
|---|---|---|
| **Tier 1** | Simple operations, Shopify is the only tool | Shopify Admin is the complete back office |
| **Tier 2** | Growing complexity, starting to outgrow Shopify for some workflows | Shopify + some 3P apps for specific needs |
| **Tier 3** | Complex operations, significant 3P tool usage | Shopify as one of several systems; integration-dependent |
| **Tier 4** | Enterprise operations, Shopify is one component in a larger tech stack | ERP/OMS as system of record; Shopify for commerce layer |

**Critical insight from Deliver:** "In 2023, Deliver aimed to support Tier 2 Merchants who found Shopify insufficient for their growing needs... it became evident that the challenges faced by these Tier 2 Merchants were similar to those encountered by larger merchants, indicating a commonality in the obstacles across different merchant tiers."

Source: [Deliver Team Docs](https://vault.shopify.io/teams/2091-Deliver/docs)

---

## 12. Key Implications for Admin Design

### The Fundamental Tension
Shopify's admin must serve:
- A **solo founder** making their first sale
- AND a **200-person team** managing 50,000 products across 20 countries

This is the same admin. The same navigation. The same pages.

### Design Principles Emerging from Scale Research

1. **Simplicity is not always the answer.** As Katie Cerar noted at Summit 2019: "As experts, we don't necessarily want simplicity, we want agency." For power users, hiding complexity is itself a form of friction.

2. **The admin becomes a different tool at scale.** At Tier 1, the admin IS the business. At Tier 4, the admin is a monitoring dashboard. The same UI cannot optimally serve both.

3. **Merchants don't outgrow Shopify -- they outgrow the admin.** Deliver's observation that merchants turn to external tools is not about platform capability but about UI/UX at scale.

4. **Feature gating creates artificial cliffs.** The B2B example is illustrative: 19K+ non-Plus merchants pay for 3P apps because native B2B is gated to Plus. This creates worse experiences and makes migration harder.

5. **Multi-everything is the norm, not the exception.** Most growing merchants are multi-channel, multi-market, or multi-location. The admin should assume complexity, not treat it as an edge case.

6. **The "PhD in Shopify" problem is real.** Complex things are possible but require deep expertise. Markets aims to solve this for international selling. Similar approaches are needed everywhere.

7. **Two-way growth engine:** Core creates new entrepreneurs while Plus retains scaling ones. Plus success gives Core merchants confidence they won't outgrow the platform. The admin must support this entire journey without forcing re-learning.

### Questions for Admin Redesign

- How should the admin adapt its surface area based on merchant scale and complexity?
- Should there be explicit "modes" or should adaptation be implicit/progressive?
- Where should Shopify draw the line between "admin as workspace" and "admin as API consumer"?
- How can the admin support specialist roles (merchandiser, fulfillment operator, finance manager) without fragmenting the experience?
- What would a "zero-config" admin look like that progressively reveals complexity as merchants grow?

---

## Source Index

### Vault Pages
- [Merchant Journey Segmentation](https://vault.shopify.io/teams/2327-Executive-Insights/docs/14477-Merchant-Journey-Segmentation) -- Official segmentation model
- [Commerce Components Overview](https://vault.shopify.io/docs/shopify-platform-and-product/Commerce-Components) -- CCS documentation
- [Commerce Components by Shopify (Detail)](https://vault.shopify.io/docs/shopify-platform-and-product/Commerce-Components/commerce-components-overview) -- CCS overview
- [Plus and Enterprise Support](https://vault.shopify.io/docs/craft/274-Support/15052-Teams-in-Support/Plus%20and%20Enterprise%20Support) -- Support org structure
- [Deliver Team Docs](https://vault.shopify.io/teams/2091-Deliver/docs) -- Back office vision, tiers & personas
- [Location Limit Requests](https://vault.shopify.io/teams/126-Inventory/docs/18427-Inventory-Engineering/1467-Inventory-ATC/8610-Location-limit-Requests) -- Location scaling rules
- [Retail Data Science Glossary](https://vault.shopify.io/docs/shopify-platform-and-product/8061-Merchant-Services-Group/Retail/Glossary) -- Retail definitions and segments
- [Merchant Frustrations - Plus](https://vault.shopify.io/docs/craft/274-Support/Merchant-Frustrations/MF-Plus-frustrations) -- Plus-specific frustration tracking
- [Zip Segment Guide for Marketers](https://vault.shopify.io/docs/shopifolk-essentials/511-Finance---Procurement/771-The-Procurement-Pathway/2135-Zip-As-the-main-intake-service-in-the-pathway/zip-for-requesters/Zip-Segment-Guide-for-Marketers) -- Marketing segments

### Vault Projects
- [Merchant Segmentation (GSD #16441)](https://vault.shopify.io/projects/16441-Merchant-Segmentation) -- Original segmentation project
- [B2B Merchant Segmentation (GSD #13376)](https://vault.shopify.io/projects/13376-B2B-Merchant-Segmentation) -- B2B-specific segmentation
- [B2B Moving Downmarket (GSD #48961)](https://vault.shopify.io/projects/48961-B2B-Moving-B2B-Downmarket) -- 2026 B2B expansion project
- [Retail Audiences and Personas Guide Refresh (GSD #47977)](https://vault.shopify.io/projects/47977-Retail-Audiences-and-Personas-Guide-Refresh) -- Retail persona work

### Vault TV (Summit/Town Hall Talks)
- [Solving for Scale -- Katie Cerar & Hana Abaza, Summit 2019](https://vault.shopify.io/tv/series/12-Summit/episodes/176-Katie-Cerar-Hana-Abaza-Solving-for-Scale) -- Foundational Plus/Enterprise vision
- [Origin of Plus -- Tobi & Harley, Context 2019](https://vault.shopify.io/tv/series/13-Context/episodes/304-Episode-38-Tobi-and-Harley-on-The-Origin-of-Plus) -- Strategic rationale for Plus
- [Markets -- Rohit Mishra, Summit 2024](https://vault.shopify.io/tv/series/12-Summit/episodes/118-Rohit-Mishra-A-central-home-for-Markets) -- Unified Markets vision
- [Markets Pro -- Editions 2023](https://vault.shopify.io/tv/series/15-Editions/episodes/779-Introducing-Markets-Pro) -- Managed Markets launch
- [Glen Walkthrough Demo -- Editions 2024](https://vault.shopify.io/tv/series/15-Editions/episodes/809-Glen-Walkthrough-Demo) -- 2K variants, B2B, performance
- [Multi-Location Town Hall 2016](https://vault.shopify.io/tv/series/1-Shopify-Town-Hall/episodes/721) -- Multi-location inventory launch
- [Shopify IRL -- IBK Ajila & Arati Sharma, Summit 2017](https://vault.shopify.io/tv/series/12-Summit/episodes/224-IBK-Ajila-Arati-Sharma-Shopify-IRL) -- POS and retail vision

### Key Vault Posts
- [Q4 2024 Earnings Revenue Story](https://vault.shopify.io/posts/265265) -- Enterprise growth metrics
- [Enterprise Update Post (CCS/Enterprise Plan)](https://vault.shopify.io/posts/265638) -- Enterprise billing details
- [Products Initiatives Update Nov 2024](https://vault.shopify.io/posts/245732) -- 2K variants scaling details
- [Large/Complex Orders Investigation](https://vault.shopify.io/posts/171462) -- Admin breaking points for B2B
- [B2B Core Update](https://vault.shopify.io/posts/211696) -- B2B company location limits
- [Retail Weekly Update W21](https://vault.shopify.io/posts/292573) -- Current retail challenges
- [Helen Mou W26 Retail Update](https://vault.shopify.io/posts/297473) -- Hierarchy of needs, POS customization
- [NRF CCS Launch](https://vault.shopify.io/posts/257416) -- Commerce Components launch at NRF 2023
- [Q1 2025 Enterprise Account Success](https://vault.shopify.io/posts/286070) -- Enterprise merchant examples
- [Retail First-Time Landing Experience](https://vault.shopify.io/posts/330662) -- Retail onboarding differentiation
- [Shopify Balance $500M Milestone](https://vault.shopify.io/posts/335290) -- Financial services scale

---

*Last updated: 2026-02-05*
