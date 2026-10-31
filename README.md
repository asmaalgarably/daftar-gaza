# DAFTAR (دَفْتَر): Cryptographic Mutual Ledger & Community Credit Protocol

> **A Low-Bandwidth, Zero-Knowledge Digital Credit & Debt Ledger Tailored for Gaza's Cashless and Displaced Economy.**  
> Deployed on **Vercel Edge**, secured via **WebCrypto & Field-Level Encryption**, engineered with strict **TDD (Test-Driven Development)**, and automated via **GitHub Actions CI/CD**.

---

## 1. Executive Summary & Problem Space

### 1.1 The Ground Reality in Gaza
In the midst of total banking suspension, physical cash eradication, and continuous mass displacements across Gaza (Mawasi, Deir al-Balah, Jabalia), over **80% of daily transactions operate on informal credit ("الشكك" / Deferred Debt)**.
People buy flour, baby formula, solar battery charging hours, potable water gallons, and medications on credit.

### 1.2 The Catastrophic Vulnerabilities of Current Paper Ledgers
Currently, merchants track hundreds of debts on worn, greasy paper notebooks:
1. **Physical Annihilation:** Displacements, tent fires, and airstrikes destroy physical notebooks, eradicating merchants' life savings and leaving displaced families with disputed, untraceable debts.
2. **Unilateral Accounting & Disputes:** Only the merchant writes in the book. Bitter social arguments erupt ("I paid you 50 NIS last week! - No, you didn't, my book says 200 NIS!").
3. **Severe Privacy & Dignity Violations:** Physical books sit open on counters. Neighbors see who owes what, inflicting social humiliation on destitute families.
4. **Internet Breakdown:** Conventional accounting SaaS apps fail completely because cellular towers and internet connections in Gaza are intermittent or offline for days.

---

## 2. The Solution: DAFTAR Architecture

**DAFTAR** replaces physical notebooks with a **tamper-evident, two-party signed, offline-resilient web ledger**:

* **Mutual Cryptographic Handshake:** Neither party can unilaterally create, edit, or delete a debt without the other party's cryptographic signature.
* **Offline Dynamic QR Signing:** Works when the customer has zero cellular connection. The merchant renders a dynamic signed QR code with a single-use `Nonce` and a 2-minute time-to-live (TTL). The customer's phone camera scans and signs locally.
* **Zero-Knowledge Field-Level Encryption (AES-256-GCM):** Debt descriptions, customer names, and balances are encrypted with keys derived from user PINs. Even database administrators cannot read who owes what.
* **Tamper-Proof Audit Chain (Hash Chaining):** Every new credit or settlement entry is cryptographically linked to the previous entry, preventing retro-active forgery.

---

## 3. The `skills.sh` AI Agent Toolbelt

To guarantee enterprise-grade security and mathematically verifiable correctness, development is driven by curated modular skills from **`skills.sh`**:

| Skill Package | Repository / Identifier | Primary Function in SDLC |
| :--- | :--- | :--- |
| **`superpowers`** | `obra/superpowers` | Enforces strict **Test-Driven Development (TDD: Red-Green-Refactor)**, micro-tasking plans, and invariant testing before any feature code is written. |
| **`security-fuzzing`** | `eyadkelleh/awesome-claude-skills-security` | Injects malicious payloads (SQLi, XSS, buffer overflows, malformed Palestinian phone numbers) into all endpoints. |
| **`owasp-security-testing`** | `thetestingacademy/owasp-security-testing` | Tests against OWASP Top 10: IDOR authorization bypasses, rate limiting, and sensitive data exposure. |
| **`next-app-router`** | `vercel/next-app-router` | Enforces Next.js App Router best practices, Edge server actions, and bundle optimization (< 150KB). |
| **`supabase-postgres`** | `supabase/postgres-best-practices` | Formulates Row-Level Security (RLS) policies, preventing tenant data leaks at the database engine level. |
| **`offline-first-pwa`** | `skills-pwa/offline-first-patterns` | Implements Service Worker caching, background synchronization, and conflict-free local state resolution. |

### Installation via CLI:
```bash
# Core TDD discipline
npx skills add obra/superpowers -y

# Penetration testing & OWASP compliance
npx skills add eyadkelleh/awesome-claude-skills-security --skill security-fuzzing -y
npx skills add thetestingacademy/owasp-security-testing -y
```

---

## 4. Technical Stack

* **Framework:** Next.js 14+ (App Router, Server Actions, React 18, TypeScript 5).
* **Styling & UI:** Tailwind CSS (Native Arabic RTL direction, Mobile-First Dark Slate & Warm Amber theme).
* **State & Offline Storage:** Zustand + IndexedDB (Local caching for zero-connectivity operation).
* **Cryptography:** Native Browser `WebCrypto API` (Ed25519 / ECDSA signatures) + Node.js `crypto` (AES-256-GCM).
* **Database & Auth:** Supabase (Serverless PostgreSQL with RLS enabled).
* **Caching & Rate Limiting:** Upstash Redis (Edge Rate Limiting & ephemeral Nonce verification).
* **Testing Suite:** Vitest (Unit/Invariant tests), Playwright (E2E browser tests), Fast-Check (Property-based tests).
* **Cloud Hosting:** Vercel (Edge Network, Serverless Functions, Automatic CI/CD Previews).

---

## 5. Automated CI/CD Pipeline (GitHub Actions to Vercel)

Every `git push` to `main` triggers an automated verification and deployment pipeline. If a single test fails, the deployment is blocked.

File: `.github/workflows/ci-cd.yml` runs:
1. Code Quality & TypeScript Check (`tsc --noEmit`, ESLint)
2. Invariant & TDD Test Suite (`vitest run`)
3. Security Vulnerability & Fuzzing Audit (`npm audit`, custom security tests)
4. Automated Deployment to Vercel Production
