# Meeting Action Extractor — Frontend UI Guide

A complete reference for the frontend user interface: design system, light/dark theming, layout, components, motion, states, and how each screen is presented to the user.

> **Scope:** UI and visual behavior only. This document does not cover API integration, backend logic, or deployment.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Typography](#2-typography)
3. [Color & Theme System](#3-color--theme-system)
4. [Dark Mode](#4-dark-mode)
5. [Spacing, Borders & Shadows](#5-spacing-borders--shadows)
6. [Background & Glass Surfaces](#6-background--glass-surfaces)
7. [Motion & Animation](#7-motion--animation)
8. [Global Layout](#8-global-layout)
9. [Application Shell](#9-application-shell)
10. [Home Page](#10-home-page)
11. [Transcript Input Module](#11-transcript-input-module)
12. [AI Extraction Experience](#12-ai-extraction-experience)
13. [Task Results Dashboard](#13-task-results-dashboard)
14. [Reusable UI Components](#14-reusable-ui-components)
15. [Responsive Behavior](#15-responsive-behavior)
16. [UI States & Feedback](#16-ui-states--feedback)
17. [Accessibility](#17-accessibility)
18. [File Map](#18-file-map)

---

## 1. Design Philosophy

The UI is designed to feel like a **premium AI SaaS product** — inspired by OpenAI ChatGPT, Linear, Notion AI, Vercel, Raycast, and Arc Browser.

| Principle | How it shows up |
|---|---|
| Clean | Minimal chrome, no loud gradients or decorative clutter |
| Premium | Soft layered shadows, 20px card radius, glass surfaces, generous whitespace |
| Professional | Muted palette with indigo primary accent; deep charcoal dark mode |
| Intelligent | Gradient text on "AI", feature badges, subtle ambient background orbs |
| Spacious | Full-width layout with consistent horizontal padding |
| Subtle motion | Fade, lift, stagger, shimmer — never bouncy or flashy |

**No emojis** are used in the interface. Icons come from **Lucide React** only.

The redesign preserves all existing functionality — only visual design, responsiveness, accessibility, and UX were improved.

---

## 2. Typography

### Font Family

**Plus Jakarta Sans** (Google Fonts) is loaded in `index.html` and applied globally via CSS variables.

```css
--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, ...
```

### Rendering

| Property | Value |
|---|---|
| Line height | `1.5` |
| Font features | `"cv11", "ss01"` (stylistic sets) |
| Antialiasing | `-webkit-font-smoothing: antialiased` |
| Text rendering | `optimizeLegibility` |

### Type Scale (in use)

| Element | Classes | Appearance |
|---|---|---|
| Hero title | `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight` | Large, bold, centered |
| Hero "AI" word | `.text-gradient-primary` | Indigo → violet gradient clip |
| Hero subtitle | `text-base sm:text-lg text-muted` | Relaxed line height, muted |
| Hero badges | `text-xs font-medium` | Pill badges with check icons |
| Section title | `text-base font-semibold tracking-tight` | Card headers |
| Body / labels | `text-sm` | Form fields, table cells |
| Meta / counters | `text-xs` | Character count pill, table headers |
| Summary numbers | `text-3xl lg:text-4xl font-bold tracking-tight` | Dashboard stat cards |

---

## 3. Color & Theme System

Colors are defined once in `src/styles/globals.css` as CSS custom properties on `:root` (light) and `.dark` (dark). They are exposed to Tailwind via `@theme` and mirrored in `src/constants/theme.ts` for programmatic use.

**Components reference semantic Tailwind tokens** — never hardcoded hex values in JSX.

### Architecture

```
globals.css (:root / .dark CSS variables)
       ↓
@theme (Tailwind semantic tokens)
       ↓
Components (bg-background, text-muted, border-border, etc.)
```

### Semantic Tokens

| Token | Tailwind class | Usage |
|---|---|---|
| Background | `bg-background` | Page fill |
| Surface | `bg-surface` | Inputs, secondary panels, header icon areas |
| Card | `bg-card` | Cards, table wrapper, dropdowns |
| Border | `border-border` | Structural borders, dividers |
| Foreground | `text-foreground` | Primary text |
| Muted | `text-muted` | Secondary text, labels |
| Muted foreground | `text-muted-foreground` | Placeholder text |
| Primary | `bg-primary`, `text-primary` | Buttons, focus rings, icons, accents |
| Primary foreground | `text-primary-foreground` | Text on primary buttons |
| Success | `text-success`, `bg-success/10` | Assigned badges, Easy difficulty |
| Warning | `text-warning`, `bg-warning/10` | Near-limit counter, Medium difficulty |
| Danger | `text-danger`, `bg-danger/10` | Validation errors, Hard difficulty |
| Hover | `bg-hover` | Row hover, dropdown hover, secondary surfaces |
| Ring | `ring-ring` | Focus rings |
| Overlay | `bg-overlay` | Modal overlays (reserved) |
| Dropdown | `bg-dropdown` | Sample transcript dropdown |
| Popover | `bg-popover` | Popover surfaces (reserved) |
| Skeleton | `bg-skeleton` | Skeleton loader base color |

### Light Theme Palette

| Token | Hex | Notes |
|---|---|---|
| `background` | `#fafafa` | Off-white page background |
| `surface` | `#ffffff` | Pure white surfaces |
| `card` | `#ffffff` | Card backgrounds |
| `border` | `#e4e4e7` | Very subtle borders |
| `foreground` | `#18181b` | Primary text |
| `muted` | `#71717a` | Secondary text |
| `muted-foreground` | `#a1a1aa` | Placeholders |
| `primary` | `#5e6ad2` | Indigo accent |
| `success` | `#22c55e` | Green |
| `warning` | `#f59e0b` | Amber |
| `danger` | `#ef4444` | Red |
| `hover` | `#f4f4f5` | Hover backgrounds |

### Dark Theme Palette

| Token | Hex | Notes |
|---|---|---|
| `background` | `#09090b` | Deep charcoal — not pure black |
| `surface` | `#18181b` | Elevated surface |
| `card` | `#18181b` | Card backgrounds |
| `border` | `#3f3f46` | Subtle zinc borders |
| `foreground` | `#fafafa` | Primary text |
| `muted` | `#a1a1aa` | Secondary text |
| `muted-foreground` | `#71717a` | Placeholders |
| `primary` | `#818cf8` | Brighter indigo for contrast |
| `hover` | `#27272a` | Slightly brighter surface on hover |

### CSS Utilities

| Utility class | Purpose |
|---|---|
| `.text-gradient-primary` | Indigo → violet gradient text (hero "AI") |
| `.glass-surface` | Frosted glass: `backdrop-filter: blur(16px)`, semi-transparent bg |
| `.transition-theme` | Smooth 300ms transitions on bg, border, color, shadow |
| `.animate-shimmer` | Skeleton shimmer animation |
| `.app-background` | Fixed ambient gradient orbs behind content |

### Badge Variants (`Badge` component)

| Variant | Visual |
|---|---|
| `default` | Muted surface, subtle border |
| `primary` | Indigo tint — "Hackathon Demo" header badge |
| `success` | Green tint — Easy sample difficulty |
| `warning` | Amber tint — Medium sample difficulty |
| `danger` | Red tint — Hard sample difficulty |

### Task Status Badge Tones (`TaskStatusBadge`)

| Tone | Condition | Style |
|---|---|---|
| Assigned | Owner is not "Unassigned" | Green filled pill |
| Unassigned | Owner === "Unassigned" | Gray pill |
| Due Date | `due_date` !== "No date given" | Blue outlined pill |
| No Due Date | `due_date` === "No date given" | Amber outlined pill |

A task row can display **both** an assignment badge and a due-date badge simultaneously.

---

## 4. Dark Mode

### Implementation

Dark mode uses **Tailwind class-based** switching via the `.dark` class on `<html>`.

```css
@custom-variant dark (&:where(.dark, .dark *));
```

### Theme Provider Stack

| File | Role |
|---|---|
| `src/hooks/useTheme.ts` | Theme state, localStorage persistence, DOM class toggling |
| `src/contexts/theme-context.ts` | React context + `useThemeContext()` hook |
| `src/providers/ThemeProvider.tsx` | Provider component wrapping the app |
| `src/components/common/ThemeToggle.tsx` | Animated sun/moon toggle in header |
| `src/components/common/ThemedToaster.tsx` | Sonner toasts synced to active theme |
| `index.html` (inline script) | Flash prevention before React hydrates |

### Preference Resolution (first visit)

1. Read `localStorage.getItem('theme')` — if `'light'` or `'dark'`, use it
2. Otherwise, detect `prefers-color-scheme: dark` via `matchMedia`
3. Apply `.dark` class to `<html>` immediately (inline script) and on mount (hook)

### Theme Toggle

Located **top-right in the header**, next to the "Hackathon Demo" badge.

| Property | Value |
|---|---|
| Icons | Sun (light mode) / Moon (dark mode) |
| Animation | 300ms rotate + scale crossfade via Framer Motion |
| Interaction | `active:scale-95`, hover surface brighten |
| ARIA | `aria-label`: "Switch to light/dark mode" |

### Smooth Transitions

- `body` transitions `background-color` and `color` over 300ms
- `.transition-theme` utility on header, cards, and key surfaces
- `color-scheme: light` / `color-scheme: dark` set on `<html>` for native form controls

---

## 5. Spacing, Borders & Shadows

### Border Radius

| Token / Class | Value | Used on |
|---|---|---|
| `--radius-card` | `1.25rem` (20px) | Cards, table wrapper, mobile task cards, summary cards |
| Buttons / inputs | `rounded-xl` (12px) | Buttons, textarea, dropdowns, theme toggle |
| Badge pills | `rounded-full` | All badges and status pills |
| Avatars | `rounded-full` | Owner initials in table/cards |

### Shadows

| Token | Effect |
|---|---|
| `--shadow-card` | Default resting shadow — soft, low elevation |
| `--shadow-card-hover` | Elevated shadow on card/row hover |
| `--shadow-glass` | Glass surfaces — inset highlight + soft drop shadow |

Shadow values adapt per theme (lighter in light mode, deeper in dark mode).

### Container Padding

Full viewport width with responsive horizontal padding:

```
px-4  → mobile
sm:px-6
lg:px-10
xl:px-12
```

### Panel Heights

| Panel | Height |
|---|---|
| Transcript Input card | Fixed `h-[480px]` |
| Task Dashboard card | Minimum `min-h-[480px]`, scrolls internally when content overflows |

---

## 6. Background & Glass Surfaces

### Ambient Background (`AppLayout`)

A fixed `.app-background` layer sits behind all content (`z-index: -1`):

```
┌─────────────────────────────────────────┐
│  ::before  — large orb, top-right         │
│  ::after   — large orb, bottom-left       │
│  .app-background-orb — center orb         │
└─────────────────────────────────────────┘
```

- Orbs use `--gradient-orb-1/2/3` (soft indigo/violet, very low opacity)
- `filter: blur(80–100px)` creates depth without distraction
- Orbs transition with theme changes

### Glass Surfaces

Applied via `.glass-surface` and the `glass` prop on `Card`:

| Property | Value |
|---|---|
| Background | `var(--glass)` — semi-transparent surface |
| Border | `var(--glass-border)` |
| Backdrop | `blur(16px) saturate(180%)` |
| Shadow | `var(--shadow-glass)` |

Used on: **AppHeader**, **TranscriptInput card**, **TaskDashboard card**.

### Custom Scrollbars

Thin, rounded scrollbars on all scrollable elements:

| Property | Value |
|---|---|
| Width / height | `6px` |
| Thumb | `var(--scrollbar-thumb)`, `border-radius: 9999px` |
| Track | Transparent |
| Hover | Thumb brightens to `var(--muted)` |
| Firefox | `scrollbar-width: thin` |

---

## 7. Motion & Animation

All animations use **Framer Motion**. Shared variants live in `src/lib/motion.ts`.

### Shared Variants

#### `fadeInUp`
```ts
hidden:  { opacity: 0, y: 16 }
visible: { opacity: 1, y: 0, duration: 0.45s, ease: cubic-bezier(0.25, 0.1, 0.25, 1) }
```
Used for: hero text, transcript textarea, toolbar, sample dropdown items.

#### `fadeIn`
```ts
hidden:  { opacity: 0 }
visible: { opacity: 1, duration: 0.4s, ease: easeOut }
```

#### `staggerContainer`
```ts
visible: { staggerChildren: 0.1s, delayChildren: 0.05s }
```
Used for: hero section entrance on page load.

### Component-Specific Motion

| Component | Animation |
|---|---|
| **Card** | Fade-up on scroll into view (`whileInView`); lifts `-3px` on hover; `scale: 0.995` on tap |
| **Hero** | Staggered fade-up on mount; gradient "AI" text static |
| **Hero badges** | Fade-up with 0.16s delay |
| **ThemeToggle** | Sun/moon rotate + scale crossfade (300ms) |
| **ExtractionProgress** | Fade-up entrance; Bot icon pulses scale/opacity; shimmer progress bar slides |
| **Extraction banner** | `AnimatePresence` height collapse on exit |
| **SummaryCards** | Staggered fade-up per card; hover lift `-4px`; count re-animates on value change |
| **TaskToolbar** | Fade-up with delay |
| **TaskTable rows** | Staggered fade-up per row (0.03s delay each); hover background |
| **TaskCard (mobile)** | Staggered fade-up; hover lift `-2px`; tap scale `0.99` |
| **EmptyResults** | Fade-up on appear |
| **Load Sample chevron** | Rotates 180° when dropdown opens |
| **Button** | Hover lift `-1px`; active `scale-[0.98]`; spinner on `Loader2` |
| **Skeleton** | CSS `animate-shimmer` gradient sweep (1.8s loop) |

### Animation Principles

- Durations stay between **0.2s – 0.5s**
- Easing is smooth cubic-bezier `[0.25, 0.1, 0.25, 1]` or `easeInOut`
- No bounce, spring overshoot, or flashy effects
- `viewport: { once: true }` on scroll-triggered card animations

---

## 8. Global Layout

```
┌─────────────────────────────────────────────────────────┐
│  .app-background (fixed ambient orbs)                   │
├─────────────────────────────────────────────────────────┤
│  AppHeader (sticky, glassmorphism)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  main (flex-1, vertically centered)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Container (full width, responsive px)            │  │
│  │                                                   │  │
│  │  [ Page Content ]                                 │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  AppFooter (full width, centered text)                  │
└─────────────────────────────────────────────────────────┘
```

- `min-h-screen` on the root layout ensures the page always fills the viewport
- `main` uses `justify-center` to vertically center content between header and footer
- Header, main, and footer all share the same `Container` padding so edges align
- Ambient background is `aria-hidden` and does not affect accessibility tree

---

## 9. Application Shell

### Header (`AppHeader`)

| Zone | Content |
|---|---|
| Left | Sparkles icon in indigo-tinted rounded square + title + subtitle |
| Right | `Hackathon Demo` primary badge (hidden on mobile) + `ThemeToggle` |

- **Sticky** (`sticky top-0 z-50`) — stays visible while scrolling
- **Height:** `4.375rem` (~70px)
- **Surface:** `.glass-surface` with `border-b`, `shadow-[var(--shadow-glass)]`, backdrop blur
- **Logo hover:** Icon container scales `1.05` on hover

### Footer (`AppFooter`)

- Single centered line: *"Built with React + FastAPI"*
- Muted `text-sm`, top border separator
- Full width, same horizontal padding as header

### Toast Notifications (`ThemedToaster`)

- Position: **top-right**
- `richColors` enabled
- Theme synced to light/dark via `useThemeContext()`
- Used for: sample loaded, extraction success, extraction failure

| Event | Message | Type |
|---|---|---|
| Sample selected | "Sample transcript loaded." | Success |
| Extraction done | "Tasks extracted successfully." | Success |
| Extraction failed | "Failed to analyze transcript. Please try again." | Error |

---

## 10. Home Page

The Home page is the only route (`/`). It orchestrates the full user workflow.

### Visual Structure (top → bottom)

```
┌─────────────────────────────────────────────────────────┐
│                      HERO SECTION                       │
│    [AI] Meeting Action Extractor (gradient on "AI")     │
│              Subtitle (centered, muted)                 │
│     ✓ AI Powered  ✓ FastAPI Ready  ✓ Smart Task...     │
├─────────────────────────────────────────────────────────┤
│              EXTRACTION PROGRESS (conditional)          │
│         Shown only while isExtracting === true          │
├──────────────────────┬──────────────────────────────────┤
│   TRANSCRIPT INPUT   │       TASK DASHBOARD             │
│   (left column)      │       (right column)             │
│   glass card         │       glass card                 │
│   h-[480px] fixed    │       min-h-[480px] scrollable   │
└──────────────────────┴──────────────────────────────────┘
```

### Hero (`PageHeader`)

- **Title:** Gradient **"AI"** + " Meeting Action Extractor"
- **Subtitle:** "Paste your meeting transcript and instantly extract structured action items with owners and deadlines."
- **Feature badges:** `AI Powered`, `FastAPI Ready`, `Smart Task Extraction`
- Center-aligned, max-width constrained for readability
- Animates in with staggered fade-up on page load

### Two-Column Grid

| Breakpoint | Layout |
|---|---|
| Mobile / Tablet | Single column, stacked |
| `lg` and above | Two equal columns (`grid-cols-2`), 32px gap |

---

## 11. Transcript Input Module

**Component:** `TranscriptInput`  
**Location:** Left column on Home page  
**Card style:** `glass` with `hover={false}`

### Card Header

| Field | Text |
|---|---|
| Title | Meeting Transcript |
| Description | Paste your meeting transcript below. |

### Textarea

| Property | Value |
|---|---|
| Height | Fixed `260px`, scrollable (`overflow-y-auto`) |
| Resize | Disabled |
| Placeholder | Multi-line example transcript (John / Sarah / Mike) |
| Surface | `bg-surface` with soft inner shadow |
| Hover | `border-primary/30` |
| Focus | Primary border + `ring-2 ring-ring/25` + outer glow via `box-shadow` |
| Error state | Red border + red focus ring |
| Disabled | Reduced opacity, not-allowed cursor (during extraction) |

### Validation (shown in UI)

| Rule | Message |
|---|---|
| Required | "Transcript is required." |
| Min 30 chars | "Transcript must be at least 30 characters." |
| Max 20,000 chars | "Transcript must not exceed 20,000 characters." |

Errors appear **below the textarea** in `text-danger`.

### Character Counter

Displayed bottom-right in a **pill badge**: `617 / 20,000`

| Threshold | Color |
|---|---|
| Normal (< 80%) | `text-muted` |
| ≥ 80% of limit | `text-warning` (amber) |
| ≥ 95% of limit | `text-danger` (red) |

Pill styling: `rounded-full border border-border bg-hover/50 px-2.5 py-0.5 text-xs tabular-nums`

### Toolbar

```
┌─────────────────────────────────────────────────────────┐
│  [Load Sample ▾]              [Clear]  [Extract Tasks]  │
└─────────────────────────────────────────────────────────┘
```

#### Load Sample Dropdown

Each option displays:

```
┌──────────────────────────────────────┐
│  Sprint Planning          [Medium]   │
│  Planning meeting for Sprint 24...   │
└──────────────────────────────────────┘
```

| Difficulty | Badge color |
|---|---|
| Easy | Green (`success`) |
| Medium | Amber (`warning`) |
| Hard | Red (`danger`) |

Dropdown surface: `bg-dropdown`, `backdrop-blur-xl`, `shadow-[var(--shadow-card-hover)]`

Three built-in samples:
1. **Weekly Product Standup** — Easy
2. **Sprint Planning** — Medium
3. **Enterprise Rollout War Room** — Hard

Selecting a sample fills the textarea and shows a success toast.

#### Action Buttons

| Button | Variant | Enabled when |
|---|---|---|
| Clear | Secondary | Transcript is not empty |
| Extract Tasks | Primary | Form is valid (≥ 30 chars) |
| Extract Tasks (loading) | Primary + spinner | Shows "Analyzing..." |

All controls are disabled during extraction.

---

## 12. AI Extraction Experience

**Component:** `ExtractionProgress`  
**Shown:** Between hero and two-column grid, only while `loading === true`

### Visual Layout

```
┌─────────────────────────────────────┐
│           ( Bot icon )              │  ← pulsing gradient container
│   Analyzing meeting transcript...   │
│   Please wait while AI extracts...  │
│   ░░░░████████░░░░░░░░░░░░░░░░░░░   │  ← sliding shimmer bar
└─────────────────────────────────────┘
```

- Centered card, max-width `max-w-lg`
- Semi-transparent `bg-card/80` with `backdrop-blur-xl`
- Bot icon (Lucide) in gradient container — no emoji
- Progress bar: gradient segment slides left-to-right (1.8s loop)
- Enters/exits with `AnimatePresence` height animation

### Loading Side Effects (UI only)

While extracting:
- Transcript textarea → disabled
- Load Sample dropdown → disabled
- Clear button → disabled
- Extract Tasks → shows spinner + "Analyzing..."
- Task Dashboard → shows shimmer skeleton rows

---

## 13. Task Results Dashboard

**Component:** `TaskDashboard`  
**Location:** Right column on Home page  
**Card style:** `glass` with `hover={false}`  
**Props:** `tasks: ExtractedTask[]`, `loading: boolean`

### Dashboard Sections (top → bottom)

```
┌─────────────────────────────────────────────────────────┐
│  Card Header: Extracted Tasks                           │
├─────────────────────────────────────────────────────────┤
│  SECTION 1 — Summary Cards (4 stat cards)               │
├─────────────────────────────────────────────────────────┤
│  SECTION 2 — Toolbar (search, filters, count)           │
├─────────────────────────────────────────────────────────┤
│  SECTION 3 — Task Table (desktop) / Cards (mobile)      │
└─────────────────────────────────────────────────────────┘
```

---

### Section 1 — Summary Cards

Four statistic cards in a responsive grid:

| Card | Icon | Metric |
|---|---|---|
| Total Tasks | `ListTodo` | All extracted tasks |
| Assigned | `CheckCircle2` | Owner ≠ "Unassigned" |
| Unassigned | `UserX` | Owner === "Unassigned" |
| Tasks With Due Dates | `CalendarCheck` | `due_date` ≠ "No date given" |

**Grid breakpoints:**

| Screen | Columns |
|---|---|
| Mobile | 1 |
| `sm` | 2 |
| `xl` | 4 |

Each card features:
- `rounded-[var(--radius-card)]` with layered shadow
- Large animated count number (re-animates on value change)
- Small muted label
- Lucide icon in **gradient container** (top-right) — scales on group hover
- Hover: lift `-4px`, `border-primary/20`, deeper shadow

---

### Section 2 — Toolbar

```
┌──────────────────────────────────────────────────────────┐
│  [🔍 Search by task name...]   [Owner ▾]  [Sort ▾]      │
│  Showing 6 of 6 tasks                                    │
└──────────────────────────────────────────────────────────┘
```

| Control | Options |
|---|---|
| Search | Filters tasks by task name (live) |
| Owner filter | All Owners · [each unique owner] · Unassigned |
| Sort | Default · Owner A-Z · Due Date · Task Name |

All filters update the table **live** without a page refresh.  
Counter shows `Showing X of Y tasks`.

---

### Section 3 — Task Table (Desktop)

Visible at `md` breakpoint and above. Semantic HTML `<table>` inside a rounded card container.

| Column | Content |
|---|---|
| **Task** | Full task description, wraps long text |
| **Owner** | Gradient avatar circle (first letter) + owner name |
| **Due Date** | Date string, or muted text if "No date given" |
| **Status** | `TaskStatusBadge` pills |

#### Table Chrome

| Feature | Implementation |
|---|---|
| Container | `rounded-[var(--radius-card)] border shadow-[var(--shadow-card)]` |
| Sticky header | `sticky top-0 bg-surface/95 backdrop-blur-sm` |
| Alternating rows | Even: `bg-card`, odd: `bg-hover/20` |
| Max height | `max-h-[320px]` with internal scroll |
| Row hover | `bg-hover/60` with smooth transition |

#### Owner Avatar

| State | Avatar style |
|---|---|
| Assigned | Gradient `from-primary/20 to-primary/10`, primary letter, `ring-2 ring-background` |
| Unassigned | `bg-hover text-muted`, `?` letter |

---

### Section 3 — Task Cards (Mobile)

Below `md` breakpoint, the table is hidden and replaced with stacked `TaskCard` components.

Each mobile card shows:
- Task title (semibold)
- Owner section (gradient avatar + label with `User` icon)
- Due Date section (label with `Calendar` icon)
- Status badges
- Divider between title and metadata

Cards use 20px radius, layered shadow, `hover:border-primary/20`, and hover lift.

---

### Empty State (`EmptyResults`)

Shown when `tasks.length === 0` and not loading.

```
        ( ClipboardList icon in gradient container )
              No Tasks Yet
   Paste a meeting transcript and click
   Extract Tasks to generate action items.
        [ Get Started → ]
```

- Centered layout with fade-up animation
- Lucide `ClipboardList` icon in gradient bordered container
- **CTA button** focuses the transcript textarea (`#meeting-transcript`)

---

### Loading State (Dashboard)

When `loading === true`:
- Summary cards show current counts (0 on first run)
- Toolbar is visible
- Table shows **5 shimmer skeleton rows** (alternating backgrounds)
- Mobile shows **3 shimmer skeleton cards**
- Empty state is **not** shown during loading

---

## 14. Reusable UI Components

### `components/common/`

| Component | Purpose |
|---|---|
| `Badge` | Pill labels — variants: default, primary, success, warning, danger |
| `Button` | Primary, secondary, ghost — sizes sm/md, hover lift, active press, loading spinner |
| `Card` | Animated container with optional `glass` and `hover` props; `CardHeader` + `CardContent` |
| `Container` | Full-width wrapper with responsive horizontal padding |
| `EmptyState` | Dashed-border placeholder with optional icon |
| `PageHeader` | Hero title (ReactNode), subtitle, feature badges |
| `Section` | Vertical section wrapper with default py spacing |
| `SectionTitle` | Semibold card/section heading |
| `Skeleton` | Shimmer loading placeholder (`animate-shimmer`) |
| `ThemeToggle` | Animated sun/moon theme switch |
| `ThemedToaster` | Theme-aware Sonner toaster |

### `components/layout/`

| Component | Purpose |
|---|---|
| `AppHeader` | Sticky glassmorphism header with logo, badge, theme toggle |
| `AppFooter` | Minimal bottom footer |

### `components/transcript/`

| Component | Purpose |
|---|---|
| `TranscriptInput` | Full transcript input glass card with form, dropdown, and actions |

### `components/task/`

| Component | Purpose |
|---|---|
| `TaskDashboard` | Complete results dashboard orchestrator |
| `SummaryCards` | Four stat cards with gradient icon containers |
| `TaskToolbar` | Search, filter, sort controls |
| `TaskTable` | Desktop table + mobile cards + shimmer skeletons |
| `TaskCard` | Premium mobile task card |
| `TaskStatusBadge` | Assignment + due date status pills |
| `EmptyResults` | Dashboard empty state with CTA |
| `ExtractionProgress` | AI analyzing indicator with shimmer bar |

### Theme Infrastructure

| File | Purpose |
|---|---|
| `src/hooks/useTheme.ts` | Theme state hook |
| `src/contexts/theme-context.ts` | Context + `useThemeContext()` |
| `src/providers/ThemeProvider.tsx` | App-wide theme provider |
| `src/constants/theme.ts` | JS color constants (light/dark) |

### Utility

| Helper | Location | Purpose |
|---|---|---|
| `cn()` | `src/lib/utils.ts` | Tailwind class merging (`clsx` + `tailwind-merge`) |

---

## 15. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| **Mobile** (`< sm`) | Single column layout; task cards instead of table; toolbar stacks vertically; header badge hidden |
| **Tablet** (`sm` – `lg`) | Summary cards in 2 columns; single-column page layout |
| **Desktop** (`lg+`) | Two-column Home grid; full table view; toolbar inline |
| **Wide** (`xl+`) | Summary cards expand to 4 columns |

### Column Distribution

| Breakpoint | Transcript | Dashboard |
|---|---|---|
| `< lg` | Full width, stacked above dashboard | Full width |
| `≥ lg` | 50% left column | 50% right column |

---

## 16. UI States & Feedback

### Transcript Input States

| State | Visual |
|---|---|
| Empty | Extract Tasks disabled, Clear disabled |
| Typing (invalid) | Red validation message, Extract Tasks disabled |
| Valid | Extract Tasks enabled |
| Loading | All inputs disabled, "Analyzing..." on button |
| Sample loaded | Toast notification, textarea populated |

### Dashboard States

| State | Visual |
|---|---|
| Initial (no tasks) | EmptyResults with CTA |
| Loading | Shimmer skeleton rows, summary shows 0s |
| Populated | Full dashboard with live filters |
| Filtered (no matches) | Table shows 0 rows, counter shows "Showing 0 of N" |

### Card Hover States

- Default cards: lift `-3px` + deeper shadow on hover
- Form cards (`hover={false}`): no hover lift — TranscriptInput and TaskDashboard
- Summary cards: lift `-4px` on hover
- Table rows: `bg-hover/60` highlight on hover
- Mobile task cards: lift `-2px` + deeper shadow on hover

### Theme States

| State | Visual |
|---|---|
| Light | Off-white background, white cards, indigo `#5e6ad2` primary |
| Dark | Charcoal `#09090b` background, `#18181b` cards, `#818cf8` primary |
| Transitioning | 300ms smooth color/shadow transitions on surfaces |

---

## 17. Accessibility

| Feature | Implementation |
|---|---|
| Screen reader labels | `sr-only` labels on search, filters, textarea |
| ARIA on form | `aria-invalid`, `aria-describedby` on textarea |
| Live regions | Character counter (`aria-live="polite"`), extraction status (`role="status"`) |
| Alert roles | Validation errors use `role="alert"` |
| Dropdown | `aria-expanded`, `aria-haspopup`, `role="listbox"` |
| Theme toggle | `aria-label` describes target mode |
| Buttons | Explicit `aria-label` on icon-only actions |
| Semantic HTML | `<header>`, `<main>`, `<footer>`, `<table>`, `<article>` for cards |
| Keyboard | Native `<select>` elements for filters; focus rings on all interactive elements |
| Focus styles | `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` |
| Color scheme | `color-scheme` on `<html>` for native control theming |
| Contrast | WCAG AA target — brighter primary in dark mode for legibility |

---

## 18. File Map

```
src/
├── styles/
│   └── globals.css              # Theme tokens, dark mode, scrollbars, glass, ambient bg
├── constants/
│   └── theme.ts                 # JS theme constants (light/dark)
├── hooks/
│   └── useTheme.ts              # Theme state + localStorage
├── contexts/
│   └── theme-context.ts         # ThemeContext + useThemeContext()
├── providers/
│   └── ThemeProvider.tsx        # Theme provider component
├── lib/
│   ├── motion.ts                # Shared Framer Motion variants
│   └── utils.ts                 # cn() helper
├── layouts/
│   └── AppLayout.tsx            # Ambient bg + header + main + footer
├── pages/
│   └── Home/
│       └── Home.tsx             # Main page orchestration
├── components/
│   ├── common/                  # Badge, Button, Card, ThemeToggle, Skeleton, etc.
│   ├── layout/                  # AppHeader, AppFooter
│   ├── transcript/              # TranscriptInput
│   └── task/                    # Dashboard and all task UI
├── App.tsx                      # Router + ThemedToaster
└── main.tsx                     # ThemeProvider wrapper

index.html                       # Font preload + dark mode flash prevention script
```

---

## User Flow (Visual)

```
1. Land on Home
      ↓ theme applied (stored preference or system)
      ↓ fade-up hero animation with gradient "AI" + badges
2. Paste transcript OR load a sample
      ↓ toast: "Sample transcript loaded."
3. Click "Extract Tasks"
      ↓ button → "Analyzing..." + spinner
      ↓ ExtractionProgress card appears (shimmer bar)
      ↓ dashboard shows shimmer skeleton rows
4a. Success
      ↓ progress card disappears
      ↓ toast: "Tasks extracted successfully."
      ↓ dashboard populates with summary + table
4b. Failure (~10% mock rate)
      ↓ progress card disappears
      ↓ toast: "Failed to analyze transcript..."
5. Explore results
      ↓ search, filter by owner, sort
      ↓ table updates live
6. Toggle theme (optional)
      ↓ smooth 300ms transition across all surfaces
      ↓ preference saved to localStorage
```

---

*Last updated: Premium UI redesign with light/dark theme system, glassmorphism, ambient backgrounds, and polished components.*
