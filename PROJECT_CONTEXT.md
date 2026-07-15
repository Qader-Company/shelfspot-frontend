# ShelfSpot Project Context

## Status

Project is currently in setup phase.

Frontend architecture and foundations are being prepared before implementing features.

---

## Roles

### Admin

Responsible for:

* Managing companies
* Managing workers
* Reviewing requests
* Viewing reports

### Company

Responsible for:

* Managing brands
* Managing team members
* Managing services
* Viewing reports

---

## Languages

* Arabic
* English

RTL and LTR must be supported.

---

## Architecture

Feature-Based Architecture.

Main folders:

* app
* modules
* shared
* providers
* config
* i18n

---

## Notes

* Use only existing APIs.
* Do not invent endpoints.
* Do not invent business entities.
* Always inspect existing code before implementing new functionality.
* Follow AGENTS.md strictly.

---

## API Documentation

API documentation is available through the provided Postman Collections.

Never invent endpoints.

Always follow the Postman Collections when implementing services.
---

## Entities

Current known entities:

- Admin
- Company
- Worker
- Brand
- Task
- Service
- Role
- Permission
## Locale Configuration

Supported locales:

- ar
- en

Default locale:

- ar

Locale directions:

- ar => rtl
- en => ltr

To be completed after API analysis.
---

## Backend Architecture

The backend exposes two separate authentication domains.

Admin:

- Admin Login
- Admin Refresh Token

Company:

- Company Registration
- Company Login
- Company Email Verification
- Company Refresh Token

Use the appropriate Axios client for each domain.

Never mix Admin and Company authentication flows.
---

## Current Modules

Current business modules:

- Authentication
- Companies
- Brands
- Tasks
- Workers
- Services
- Access Control
- Reports

The backend uses "Tasks".

Do not introduce Campaign modules unless explicitly requested.
---

## Design System

The project uses the official ShelfSpot Figma Design System.

The design system has already been configured.

Source of truth:

- src/app/globals.css

Rules:

- Use semantic CSS variables only.
- Use Tailwind classes mapped to semantic tokens.
- Do not hardcode colors.
- Do not hardcode typography values.
- Do not introduce new design tokens without approval.
---

## Fonts

The project uses different fonts per locale.

Arabic:

- IBM Plex Sans Arabic

English:

- Poppins

Use `next/font/google`.

Font must switch automatically based on locale:

- ar => IBM Plex Sans Arabic
- en => Poppins

Do not hardcode font-family inside components.