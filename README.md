# 🚀 Graphood

> A high-performance, enterprise-grade multi-tenant SaaS ecosystem for managing localized business workspaces, developer APIs, subscription lifecycles, and AI-powered workflows.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](#-license)

🔗 **Live Platform:** [https://www.graphood.com](https://www.graphood.com)

---

## 📌 Overview

**Graphood** is an end-to-end multi-tenant SaaS architecture designed to provision, scale, and govern digital business workspaces. Engineered with Next.js 16 App Router, it provides strict data isolation, localized (Arabic/English) dashboards, automated payment webhooks, and flexible API subscription guardrails.

---

## ✨ Key Technical Highlights

### 🏢 Multi-Tenancy & Access Control
- **Isolated Workspace Paths:** Dynamic `/[locale]/[tenant_slug]` routing with server-side tenant validation.
- **Granular RBAC:** Role-based membership enforcement (`Owner`, `Admin`, `Member`) using custom middleware policies and Supabase service boundary checks.
- **Developer API Tokens:** Secure API-key generation with encryption secrets and scoped request verification.

### 💳 Complete Subscription Lifecycle & Billing
- **Automated Grace Period:** Includes a 3-day `PAST_DUE` grace period before transitioning overdue tenants to `EXPIRED`.
- **Kashier Payment Integration:** Atomic webhook provisioning with event idempotency, signature validation, and automatic monthly cycle extension.
- **Protected Access Guard:** Restricts paid workspace features upon expiration while keeping the subscription renewal dashboard accessible without redirect loops.
- **Automated Cron Worker:** Secure `GET /api/cron/subscriptions` endpoint protected by `CRON_SECRET` Bearer authentication for sending 3-day expiry reminders and transitioning overdue status.

### 🌐 Localization & User Experience
- **Full i18n Support:** Built-in localization for Arabic (RTL) and English (LTR).
- **Responsive Dashboard:** Built with Tailwind CSS, Shadcn UI components, Framer Motion animations, and custom OKLCH color palettes.
- **Branded Notification System:** Integrated with Resend for delivering localized system email templates and transactional alerts.

---

## 🛠 Tech Stack & Architecture

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Proxy Layout Guards)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict end-to-end type safety with Zod schemas)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, RPC Functions)
- **State & Data Fetching:** [TanStack Query v5](https://tanstack.com/query) & Server Actions
- **Payment Gateway:** [Kashier Gateway Integration](https://kashier.io/)
- **Email Delivery:** [Resend](https://resend.com/)
- **Styling & UI:** Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local` and configure your environment credentials:

```bash
cp .env.example .env.local