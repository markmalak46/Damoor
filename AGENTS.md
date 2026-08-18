# DAMOOR — Frontend Master Project Context V2.1

I’m starting a new e-commerce website called **Damoor**, a new local Egyptian clothing brand.

I want you to work with me on this project from the beginning and keep the following brand identity, design direction, technical stack, styling rules, architecture principles, and development standards in mind throughout the entire project.

Treat this message as the **main project context and source of truth** for all upcoming Damoor frontend development tasks.

Do not generate the entire website at once.

We will build Damoor **page by page and feature by feature**.

---

# 1. Project Overview

## Brand

- **Name:** Damoor
- **Industry:** Fashion / Clothing
- **Market:** Egypt
- **Audience:** Men and women
- **Brand Direction:** Old Money + Quiet Luxury + Modern Premium
- **Personality:** Elegant, refined, confident, minimal, sophisticated, and premium
- **Target Audience:** Men and women who appreciate premium, timeless clothing with a modern touch

Damoor should feel like an **established premium fashion brand**, not a small startup, generic local store, SaaS product, or template-based e-commerce website.

The visual identity should feel:

**Premium. Calm. Elegant. Confident. Modern. Timeless.**

The goal is to combine:

**Old Money Elegance + Quiet Luxury + Modern Premium UI + Excellent E-commerce UX.**

Old Money does **not** mean old-fashioned.

The website should still feel modern, polished, responsive, and contemporary.

---

# 2. Brand Color Palette

Use these colors consistently throughout the website:

- **Primary / Deep Navy:** `#071023`
- **Secondary / Gold:** `#C79954`
- **Background / Warm Ivory:** `#F4EFE8`
- **Accent / Soft Taupe:** `#C6B9AB`
- **Main Text / Carbon Black:** `#17181A`

## Color Usage

### Primary — `#071023`

Use this as the main dark luxury color.

It can be used for:

- Navigation bars
- Dark sections
- Footer
- Premium backgrounds
- Buttons
- Headers
- Selected states
- Strong visual elements
- Mobile navigation
- Important interaction areas

The navy should provide the main premium visual foundation of Damoor.

### Secondary — `#C79954`

Use this as the premium gold accent.

It can be used for:

- Small highlights
- Icons
- Borders
- Hover effects
- Premium details
- Selected elements
- Decorative lines
- CTA details
- Small visual indicators

Do **not** overuse the gold color.

Gold must feel subtle, controlled, intentional, and premium.

It should never make the interface look flashy or overly decorative.

### Background — `#F4EFE8`

This should be the main light background color instead of pure white.

Use it to give the website a:

- Warm
- Elegant
- Sophisticated
- Premium
- Old Money

feeling.

Pure white may be used selectively when necessary, but `#F4EFE8` should remain the dominant light background.

### Accent — `#C6B9AB`

Use this for:

- Secondary sections
- Cards
- Borders
- Muted backgrounds
- Subtle UI elements
- Supporting visual details
- Secondary surfaces

Use it carefully so the overall visual hierarchy stays clean.

### Text — `#17181A`

Use as the primary text color on light backgrounds.

Avoid pure black unless necessary.

## Design Tokens

Whenever appropriate, define reusable semantic design tokens instead of repeatedly hardcoding hex values.

Conceptually:

- `damoor-primary` → `#071023`
- `damoor-gold` → `#C79954`
- `damoor-background` → `#F4EFE8`
- `damoor-accent` → `#C6B9AB`
- `damoor-text` → `#17181A`

Maintain a consistent design system for:

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Container widths
- Section spacing
- Transitions
- Image ratios

---

# 3. Frontend Technical Stack

The frontend uses:

- **Angular 21**
- **TypeScript**
- **Angular SSR**
- **Tailwind CSS**

Use modern Angular architecture and APIs appropriate for Angular 21.

---

# 4. Non-Negotiable Technical Rules

These rules have high priority throughout the project.

## Angular

Use modern Angular best practices.

Prefer:

- Standalone components
- Modern Angular APIs
- Modern template control flow such as `@if`, `@for`, and `@switch`
- Angular Signals when they provide a real benefit
- Proper dependency injection
- Lazy loading where appropriate
- Reusable components and services
- Clean route organization
- Clear separation of responsibilities

Do not use new Angular features unnecessarily just because they exist.

Choose the **simplest modern solution that remains clean and scalable**.

## TypeScript

Keep the project strongly typed.

Use:

- Explicit interfaces and models
- Typed API responses
- Typed component inputs and outputs
- Typed service methods
- Clear data contracts
- Predictable state

Avoid `any` unless there is genuinely no reasonable typed alternative.

Never disable TypeScript safety simply to hide an error.

Fix the underlying problem instead.

---

# 5. Tailwind CSS — Strict Styling Rule

## Use Tailwind CSS only for styling.

Use Tailwind utility classes for:

- Layout
- Spacing
- Typography
- Colors
- Responsive behavior
- Hover/focus/active states
- Borders
- Shadows
- Transitions
- Animations
- Visual effects

Do **not** introduce:

- Bootstrap
- Angular Material for styling
- PrimeNG for styling
- DaisyUI
- Another CSS/UI framework
- SCSS/Sass
- Large inline `style=""` blocks
- Unnecessary custom CSS files

Do not write custom CSS rules unless **I explicitly ask you to do so**.

Existing global stylesheet files may only be used when necessary for:

- Tailwind setup
- Tailwind imports
- Font imports or global font configuration
- Required global resets
- Unavoidable global project configuration

Do not use the global stylesheet as a replacement for Tailwind utility classes.

If something can reasonably be implemented using Tailwind, use Tailwind.

Use Tailwind responsive utilities and state variants consistently.

Keep Tailwind classes organized and readable.

Reuse shared components or design patterns instead of duplicating large groups of utilities throughout the project.

---

# 6. Design Direction

Damoor should combine two visual directions.

## Old Money / Quiet Luxury

Use:

- Elegant typography
- Refined proportions
- Generous whitespace
- Strong fashion photography
- Clean composition
- Minimal visual noise
- Editorial layouts
- Sophisticated hierarchy
- Subtle luxury details

The interface should feel calm and confident rather than visually aggressive.

## Modern Premium

Combine the previous direction with:

- Modern layouts
- Clean navigation
- Smooth interactions
- High-end product presentation
- Strong responsive behavior
- Modern UX patterns
- Intentional micro-interactions
- Subtle transitions

The result should feel like a **modern premium fashion brand inspired by timeless luxury**.

---

# 7. Avoid Generic AI / Template Design

Damoor is a fashion brand, not a SaaS dashboard.

Do not default to generic AI-generated website patterns.

Avoid:

- Excessive rounded cards
- Huge border radiuses
- Random gradients
- Floating gradient blobs
- Excessive glassmorphism
- Neon colors
- Excessive shadows
- Excessive use of gold
- Too many cards
- Generic three-column card sections everywhere
- Unnecessary pill-shaped elements
- Random decorative elements
- Excessive icons
- Crowded layouts
- Overly playful UI
- Excessive animations
- Generic Bootstrap-like layouts
- Generic e-commerce templates

Do not make every section a bordered card.

Do not add decoration simply because it is visually possible.

Every visual decision should have a reason.

Prioritize **fashion-editorial composition** over generic web-template composition.

---

# 8. Layout Philosophy

Use layouts inspired by premium fashion websites.

Prefer:

- Strong imagery
- Large editorial sections
- Controlled whitespace
- Clear visual hierarchy
- Strong grid systems
- Clean alignment
- Full-width sections when appropriate
- Asymmetrical compositions when they improve the design
- Intentional section rhythm

Allow images and content to breathe.

Not every section needs:

- A card
- A border
- A different background
- A visible container
- A decorative effect

The overall page should feel balanced and intentional.

---

# 9. Typography

Typography is a major part of the Damoor identity.

The typography system should feel:

- Elegant
- Editorial
- Premium
- Modern
- Timeless
- Readable

A suitable direction may combine:

- A refined serif for major headings, hero messaging, and editorial elements
- A clean modern sans-serif for navigation, product information, forms, labels, buttons, and general UI

Maintain a consistent hierarchy between:

- Hero headings
- Section headings
- Product names
- Prices
- Body copy
- Navigation
- Labels
- Buttons
- Captions

Do not use too many fonts or font styles.

---

# 10. Product Presentation

Products should remain the primary visual focus of the shopping experience.

Prioritize:

- Large, high-quality product imagery
- Consistent image ratios
- Clean product cards
- Minimal product information
- Clear pricing
- Elegant size and color selection
- Smooth image interactions
- Premium product galleries
- Strong mobile product presentation
- Clear hierarchy

Avoid filling product cards with unnecessary:

- Buttons
- Badges
- Icons
- Borders
- Labels
- Decorative elements

Fashion photography should carry a large part of the visual experience.

Avoid awkward image crops and unnecessary layout shifts.

Use Angular image optimization features when appropriate.

---

# 11. Responsive Design

Every page must be intentionally designed for:

- Large desktop
- Desktop
- Laptop
- Tablet
- Mobile

Do not simply shrink the desktop layout.

Use Tailwind responsive utilities to adapt:

- Layout
- Spacing
- Typography
- Navigation
- Product grids
- Product galleries
- Filters
- Forms
- Commerce actions

Mobile is a first-class experience.

Important actions such as:

- Add to cart
- Select size
- Select color
- Search
- Filter
- Manage cart
- Checkout

must remain clear, accessible, and easy to use on touch devices.

## Mobile-First Implementation Rule

Follow a **mobile-first approach** for all layouts and components.

- Design and implement the mobile layout first.
- Base Tailwind utility classes should represent the mobile experience by default.
- Use responsive modifiers such as `sm:`, `md:`, `lg:`, `xl:`, and `2xl:` to progressively enhance the layout for larger screens.
- Do not build the desktop layout first and then try to force it into mobile.
- Every component should work naturally on small screens before desktop-specific enhancements are added.
- Prioritize touch usability, content hierarchy, readable typography, spacing, and performance on mobile.

**Mobile is the default starting point, not an afterthought.**

---

# 12. UX Principles

Keep the shopping experience simple, predictable, and frictionless.

Prioritize:

- Clear navigation
- Strong visual hierarchy
- Clear interaction feedback
- Easy product discovery
- Easy product selection
- Simple cart management
- Clear checkout flow
- Good mobile usability

Users should understand:

- Where they are
- What they can do
- What is loading
- Whether an action succeeded
- Whether something failed
- What they should do next

Design appropriate:

- Loading states
- Skeleton states
- Empty states
- Error states
- Disabled states
- Success feedback

These states should feel like part of the Damoor design system, not developer placeholders.

---

# 13. Architecture & Code Quality

Write production-quality code.

Prioritize:

- Readability
- Maintainability
- Scalability
- Simplicity
- Type safety
- Reusability
- Performance
- Testability
- Consistent architecture

## Reuse Before Creating

Before creating a new:

- Component
- Service
- Interface
- Model
- Utility
- Layout
- Directive

inspect the existing project first.

If a suitable implementation already exists, reuse or extend it where appropriate.

Do not create duplicate implementations such as:

`product-card-v2`

simply because understanding the existing component requires more work.

Inspect it first, then decide whether to reuse, improve, or replace it.

## Components

Do not put an entire feature into one unnecessarily large component.

Split complex components when there is a clear architectural benefit.

However, do not over-engineer simple features.

Create abstractions because they provide real reuse or separation of responsibility, not because everything needs to become its own abstraction.

---

# 14. Separation of Responsibilities

Keep concerns separated where appropriate:

- Presentation
- Business logic
- API communication
- State
- Data transformation
- Routing

API communication should live in properly structured Angular services rather than presentation templates.

Keep API models strongly typed.

Do not put excessive complex logic inside templates.

Do not turn services into dumping grounds for unrelated functionality.

## Backend & API Contract Integrity

Do **not** invent backend behavior.

Never invent:

- API endpoints
- HTTP methods
- Request payloads
- Response contracts
- Database fields
- Entity properties
- Authentication behavior
- Pagination contracts
- Filter parameters
- Backend validation rules
- Business rules

Before integrating a frontend feature with the backend, inspect the existing:

- API services
- Models/interfaces
- Backend endpoints
- Swagger/OpenAPI documentation if available
- Existing request/response contracts
- Related implementation in the repository

Use the real existing API contract as the source of truth.

If a required endpoint or contract does not exist, is incomplete, or cannot be determined from the repository, **do not guess**.

Tell me clearly what information or backend implementation is missing before building the integration around an invented contract.

Mock data may be used only when I explicitly ask for UI prototyping or when it is clearly isolated from the real API integration.

Mock structures should be easy to replace later and must not be presented as confirmed backend contracts.

---

# 15. Angular SSR

The project uses Angular SSR.

Every implementation must remain SSR-compatible.

Be careful with browser-only APIs such as:

- `window`
- `document`
- `localStorage`
- `sessionStorage`
- `navigator`
- Browser-specific DOM APIs

Do not access browser-only APIs directly without an appropriate SSR-safe strategy.

Avoid introducing:

- Hydration errors
- Server/client rendering mismatches
- Unnecessary flickering
- Duplicate requests
- Client-only rendering where meaningful SSR rendering should work

Think about SSR before implementing interactive browser-specific behavior.

---

# 16. SEO, Accessibility & Performance

Public e-commerce pages should remain SEO-friendly.

Pay attention to:

- Semantic HTML
- Heading hierarchy
- Page titles
- Meta descriptions
- Canonical URLs where appropriate
- Image alt text
- Search-engine-readable product content
- Internal links
- SSR-rendered content

Do not sacrifice good UX or design quality for SEO.

## Accessibility

Use:

- Semantic elements
- Accessible controls
- Keyboard-friendly interactions
- Appropriate focus states
- Appropriate labels
- Sufficient contrast

Accessibility should be part of the implementation, not an afterthought.

## Performance

Avoid:

- Unnecessary dependencies
- Large packages for simple functionality
- Unnecessary JavaScript
- Duplicate API requests
- Unnecessary eager loading
- Large initial bundles
- Layout shifts

Use lazy loading, route splitting, and image optimization where they provide a real benefit.

---

# 17. Scope Control

We are building Damoor **page by page and feature by feature**.

Only implement what I request.

For example:

If I ask for the **Home Page**, do not automatically create:

- Product Details
- Checkout
- Account
- Orders
- Authentication
- Admin
- Other unrelated pages

unless they are genuinely required for the requested feature or I explicitly ask for them.

Do not modify unrelated working code.

Do not rewrite existing functionality without a reason.

Do not make major architectural changes without explaining why they are necessary.

Stay within the requested scope.

---

# 18. Working Workflow

Whenever I ask you to implement or modify something, follow this process:

## Step 1 — Understand

Understand exactly what I am asking for and the expected UX/design result.

## Step 2 — Inspect

Before writing code, inspect the relevant existing files.

Understand the existing:

- Folder structure
- Routes
- Components
- Shared UI
- Services
- Models
- Design system
- Styling approach
- API contracts when relevant

**Inspect before creating.**

## Step 3 — Plan

Determine the simplest clean implementation.

Avoid unnecessary complexity.

If an important architectural decision is required, explain it briefly before making a major change.

## Step 4 — Implement

Implement only the requested feature.

Follow:

- Damoor design identity
- Angular 21 conventions
- Strict TypeScript
- SSR compatibility
- Tailwind-only styling
- Existing project architecture
- Existing backend/API contracts when relevant

## Step 5 — Verify

After implementation, check the work for:

- Angular/TypeScript errors
- Build errors
- SSR compatibility
- Desktop layout
- Tablet layout
- Mobile layout
- Responsive behavior
- Obvious UX issues
- Unintended changes to existing functionality

After meaningful code changes, run the relevant project validation commands when available.

This should normally include the appropriate:

- Angular build
- TypeScript compilation/type checking
- Existing lint checks when configured
- Existing tests when they are relevant to the modified feature

Do not assume the implementation works simply because the code looks correct.

Do **not** claim that the implementation is working, build-safe, error-free, or successfully verified unless the relevant checks were actually run and passed.

If a validation command fails:

1. Read the error.
2. Determine whether your change caused it.
3. Fix issues introduced by your implementation.
4. Run the relevant validation again.

If an existing unrelated project error prevents successful validation, clearly tell me:

- Which command was run
- What failed
- Whether the failure appears related to your change
- What remains unverified because of that failure

Do not hide failed checks.

Fix issues caused by your implementation rather than leaving them for me to discover.

---

# 19. Priority Rules

When making implementation decisions, prioritize these principles:

1. **Stay within the requested scope.**
2. **Inspect existing code before creating new code.**
3. **Preserve existing working behavior unless a change is required.**
4. **Use Tailwind CSS only for styling.**
5. **Keep all new code compatible with Angular SSR.**
6. **Maintain strict TypeScript safety.**
7. **Never invent backend/API contracts.**
8. **Keep the Damoor visual identity consistent.**
9. **Make every page properly responsive and mobile-first.**
10. **Reuse existing code where appropriate.**
11. **Avoid unnecessary dependencies and complexity.**
12. **Keep performance, SEO, and accessibility in mind.**
13. **Run relevant validation after meaningful changes.**
14. **Prefer simple, maintainable, production-quality solutions.**

---

# 20. Final Goal

The finished Damoor frontend should feel like a cohesive premium fashion experience capable of visually competing with established fashion brands.

Every page should clearly belong to the same brand.

Maintain consistency in:

- Colors
- Typography
- Spacing
- Image treatment
- Navigation
- Buttons
- Inputs
- Product presentation
- Interaction behavior
- Animations
- Visual density
- Overall design language

The final result should communicate:

**Old Money Elegance + Quiet Luxury + Modern Premium Fashion.**

Not:

**Generic E-commerce + Generic AI Design + SaaS UI.**

---

# 21. Instruction for Now

For now, **do not write or modify any code**.

Do not create:

- Pages
- Components
- Services
- Routes
- Styles
- Project files

First, read and understand this complete project context.

Then give me only a **brief confirmation** that you understand:

- The Damoor brand direction
- The color palette
- Angular 21
- Angular SSR
- Strict TypeScript
- Tailwind CSS only
- The design philosophy
- The mobile-first rule
- The inspect-before-creating rule
- The backend/API contract rule
- The page-by-page development approach
- The scope-control rules
- The validation/build-check rule

Then wait for my first implementation request.

Use this document as the **main frontend development standard for all upcoming Damoor tasks**.