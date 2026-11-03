# 📒 DAFTAR (دَفْتَر) — Autonomous Offline-First Retail Debt Ledger & POS PWA

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-emerald?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Vitest](https://img.shields.io/badge/Tests-22%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

> **DAFTAR** is a production-grade, zero-dependency, offline-first Progressive Web Application designed for local grocery stores, supermarkets, and neighborhood merchants in low-connectivity and cash-constrained economies (such as Gaza and Palestine). It replaces fragile paper notebooks with an instant, tamper-evident digital ledger equipped with thermal receipt printing, real-time camera scanning, verified QR codes, and direct WhatsApp customer dispatch.

---

## 🌟 Key Features

### 1. 📴 100% Offline-First Architecture (W3C IndexedDB)
* **Zero Cloud Dependency:** Operates seamlessly without internet or power grid stability.
* **Persistent Local Storage:** Built on a resilient native IndexedDB storage engine featuring an automated watchdog timer and cross-tab lock recovery.
* **Instant Start:** Sub-100ms cold starts with zero loading spinners or network stalls.
* **Full Data Ownership:** One-click JSON backup export and encrypted restoration at any time.

### 2. 🧾 Hardware & Retail Integrations
* **Thermal Receipt Printing:** Native print engine formatted for standard **58mm and 80mm ESC/POS thermal printers** (no vendor drivers required).
* **Live Camera QR Scanner:** In-app camera scanner powered by `html5-qrcode` to instantly verify physical receipts, customer accounts, and audit transactions.
* **Dual Barcode & QR Engine:** High-resolution vector generation of both 1D Code-128 retail barcodes and 2D QR verification codes for every transaction and account statement.

### 3. 💬 Direct WhatsApp Financial Dispatch
* **Automated Statement Sharing:** Formats and dispatches comprehensive, itemized debt statements directly to the customer's WhatsApp in one tap.
* **Pre-Formatted Receipts:** Instantly forwards verified debt notices or payment vouchers with direct cryptographic validation URLs.
* **Regional Standardization:** Automatically parses Palestinian phone numbers (`059` Jawwal / `056` Ooredoo) and transforms them into international E.164 formats (+970 / +972).

### 4. 🔔 Synthesized Web Audio Cashier Chime
* **Authentic Mechanical Sound:** Uses the Web Audio API to synthesize a physical cash register drawer latch followed by a dual-harmonic metallic chime (Ka-Ching!).
* **Non-Intrusive:** Plays exclusively upon successful debt repayments (`REPAYMENT`), giving merchants tactile, audible confirmation without cluttering general store operations.

### 5. 🛡️ Strict Financial Logic & Guardrails
* **Bounded Repayments:** Prevents human accounting errors by strictly prohibiting repayments that exceed a customer's active debt balance.
* **Palestinian Telecom Validation:** Restricts customer phone inputs to verified 10-digit Palestinian mobile prefixes (`059` and `056`).
* **Non-Blocking Safety Modals:** Completely eliminates thread-blocking `window.confirm()` and `alert()` dialogs in favor of smooth, non-blocking React modals.
* **Instant Zero-Out:** Clean factory reset functionality to clear all test records without re-seeding mock data.

### 6. 🎨 High-End Executive UI & Themes
* **Dual Visual Modes:**
  * **Luxury Night Theme:** Deep slate, emerald neon accents, and gold typography optimized for low-light shop counters.
  * **Daytime Clean Theme:** High-contrast crisp paper layout optimized for outdoor daylight legibility.
* **Responsive POS Keypad:** Built-in large numeric touch keypad optimized for tablets, touch cash registers, and smartphones.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | High-performance React framework with static export support |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety and compile-time correctness |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Rapid, responsive, mobile-first utility styling |
| **Database** | Native W3C `indexedDB` | High-throughput, client-side persistent transactional database |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, scalable UI glyphs |
| **Hardware** | CSS Paged Media `@media print` | Standardized 58mm / 80mm thermal receipt layout |
| **Audio** | Web Audio API | Zero-asset, low-latency synthesized audio feedback |
| **Testing** | [Vitest](https://vitest.dev/) | Automated unit, security, and invariant test suite |

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) v18.17.0 or higher
* `npm` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/asmaalgarably/daftar-gaza.git
   cd daftar-gaza
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run Automated Test Suite:**
   ```bash
   npm test
   ```

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing & Quality Assurance

The codebase is verified through an automated test suite located in `src/tests/`:

* **`src/tests/unit/phone.test.ts`**: Verifies Palestinian phone parsing, normalization, and prefix validation (059, 056).
* **`src/tests/unit/ledger.test.ts`**: Ensures zero-sum mathematical invariants and balances consistency across sequential transactions.
* **`src/tests/unit/backup.test.ts`**: Validates JSON schema integrity, import/export hashing, and data sanitization.
* **`src/tests/unit/crypto.test.ts`**: Confirms WebCrypto SHA-256 hash generation for digital receipts.
* **`src/tests/security/fuzzing.test.ts`**: Validates protection against malformed inputs, XSS injection strings, and boundary values.

```bash
✓ src/tests/unit/backup.test.ts (3 tests)
✓ src/tests/unit/phone.test.ts (7 tests)
✓ src/tests/unit/ledger.test.ts (3 tests)
✓ src/tests/unit/crypto.test.ts (4 tests)
✓ src/tests/security/fuzzing.test.ts (5 tests)

Test Files  5 passed (5)
     Tests  22 passed (22)
```

---

## 📱 Progressive Web App (PWA) Setup

DAFTAR is designed to be installed as a standalone desktop or mobile application:

1. Open the application in Google Chrome, Microsoft Edge, or Safari.
2. Click the **Install** or **Add to Home Screen** prompt in your address bar or browser menu.
3. Once installed, the application runs in a standalone window completely decoupled from browser navigation bars, even when disconnected from the internet.

---

## 📁 Directory Structure

```
daftar-gaza/
├── public/                  # Manifest, high-resolution icons (192px/512px), Service Worker
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.json
│   └── sw.js                # Optimized Service Worker (offline fallback)
├── src/
│   ├── app/                 # Next.js 14 App Router
│   │   ├── layout.tsx       # Root layout & PWA registration
│   │   ├── page.tsx         # Main POS & Ledger interface
│   │   └── verify/          # Public cryptographic receipt verification view
│   ├── components/          # Reusable UI & Hardware components
│   │   ├── BarcodeView.tsx       # 1D/2D Barcode & QR viewer modal
│   │   ├── CameraQRScanner.tsx   # Live camera scanner
│   │   ├── DaftarLogo.tsx        # Geometric fintech vector brand
│   │   ├── RealQRCode.tsx        # Dynamic QR generator
│   │   ├── StoreSettingsModal.tsx# Shop profile, data export, & zero-out
│   │   └── ThermalReceipt.tsx    # Print layout for 58mm/80mm thermal printers
│   ├── core/                # Core business logic & storage engines
│   │   ├── db/              # Native IndexedDB wrapper & React hook
│   │   ├── sound/           # Web Audio API cashier chime synthesizer
│   │   └── validators/      # Strict phone & financial validation rules
│   └── tests/               # Vitest automated test suite
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for community and commercial retail needs.

---

**Developed with care for local merchants and resilient communities.**  
*Author: [asmaalgarably](https://github.com/asmaalgarably)*
