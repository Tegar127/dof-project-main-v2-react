# DOF Project — Developer & Technical Documentation

> Document Management System (Sistem Manajemen Dokumen Cerdas)
> Stack: React 19 · Node.js · Express 5 · PostgreSQL · Prisma ORM · Tailwind CSS v4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation & Setup](#6-installation--setup)
7. [Environment Configuration](#7-environment-configuration)
8. [Database Setup](#8-database-setup)
9. [Running the Application](#9-running-the-application)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [API Reference](#11-api-reference)
12. [Document Export & Printing](#12-document-export--printing)
13. [Activity Logging & Auditing](#13-activity-logging--auditing)
14. [Production Deployment](#14-production-deployment)
15. [Active Directory / LDAP Integration](#15-active-directory--ldap-integration)
16. [Security Considerations](#16-security-considerations)

---

## 1. Project Overview

**DOF Project** is an intelligent, web-based document management system engineered for the creation, approval, and distribution of official documents, including Nota Dinas, SPPD (Surat Perintah Perjalanan Dinas), and Surat Perjanjian.

**Core Features:**
- **Dynamic Document Editor:** Auto-adapting input fields based on the selected document type.
- **Multi-Level Approval Workflow:** Sequential review processes for Draft/Menunggu Review documents, including reject (return with comments) and approve actions.
- **Document Disposition:** Direct distribution of approved (Final) documents to specific groups, roles, or broadly to all users.
- **Electronic Signatures & Initials:** Built-in interactive digital signatures via canvas, plus image uploads (PNG/JPG).
- **Strict Read-Only Archiving:** 100% locked documents for finalized and distributed records, ensuring compliance and data integrity.
- **Comprehensive Audit Trails:** Detailed logging of status updates, field-level modifications, and user activity.

---

## 2. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                 │
│  React 19 + Vite │ React Router v7 │ Tailwind CSS v4        │
│  Context API (Auth) │ html2pdf.js │ react-signature-canvas  │
└─────────────────────────────┬───────────────────────────────┘
                              │  HTTP/HTTPS (REST API)
                              │  Access Token: Authorization: Bearer
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy (Production)          │
│  HTTPS termination │ Static file serving │ API proxying     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js + Express Backend                 │
│  Port: 5000                                                 │
│  ├── Middleware: Helmet, CORS, Rate Limit                   │
│  ├── Auth Middleware: JWT verification + role check         │
│  ├── Services: Database interactions, File handling         │
│  └── Controllers: auth, documents, folders, groups, users   │
└─────────────────────────────┬───────────────────────────────┘
                              │  Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL Database (port 5432)                   │
│  Tables: users, groups, documents, document_versions,       │
│          document_approvals, document_logs, folders, etc.   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React | 19.x | Component-based UI framework |
| Frontend Build | Vite | 7.x | High-performance bundler and dev server |
| Frontend Routing | React Router DOM | 7.x | Client-side routing management |
| Styling | Tailwind CSS | 4.x | Utility-first CSS framework |
| Icons | lucide-react | 0.575+ | Minimalist SVG icons |
| HTTP Client | Axios | 1.13+ | REST API polling and interceptors |
| Signatures | react-signature-canvas | 1.x | Interactive digital signature pads |
| PDF Export | html2pdf.js | 0.14+ | Client-side DOM to PDF rendering |
| Backend Runtime | Node.js | 18+ | High-performance JavaScript runtime |
| Backend Framework| Express | 5.x | Web application framework for routing |
| ORM | Prisma | 6.x | Schema-driven database interactions |
| Database | PostgreSQL | 14+ | Relational enterprise database |
| Authentication | jsonwebtoken & bcryptjs | 9.x / 3.x | Secure JWT auth & password hashing |
| LDAP/AD | ldapts | 8.x | Active Directory/LDAP integration protocol |
| Validation | Zod | 4.x | Type-safe schema validation |
| Security | Helmet & express-rate-limit | 8.x / 8.x | HTTP header protection & rate mitigation |

---

## 4. Project Structure

```text
DOF Project/
├── README.md                 # Project technical documentation
├── backend/                  # REST API Service
│   ├── prisma/               # Prisma schema and generated clients
│   │   ├── schema.prisma     # Central data model definition
│   │   └── migrations/       # SQL migration history
│   ├── src/
│   │   ├── controllers/      # HTTP request handlers mapping to business logic
│   │   ├── routes/           # URL endpoint definitions & middleware mapping
│   │   └── services/         # Reusable core business and database operations
│   ├── package.json
│   └── .env                  # Backend configuration variables
│
└── frontend/                 # Client SPA application
    ├── src/
    │   ├── components/       # Presentation components (Editor, Modals, Lists)
    │   ├── context/          # Application-level state (AuthContext)
    │   ├── pages/            # Routable top-level components (Dashboard, Auth)
    │   └── utils/            # Utility functions (formatting, validation)
    ├── package.json
    └── index.css             # Tailwind imports and CSS variables
```

---

## 5. Prerequisites

| Requirement | Minimum Version | Note |
|---|---|---|
| Node.js | v20.x LTS | Backend requires modern JS features |
| npm | 10.x | Package manager |
| PostgreSQL | 14.x | Utilizing advanced relational schema |
| Git | 2.x | Source control management |

---

## 6. Installation & Setup

### Step 1: Clone the Repository
```bash
git clone <repository_url>
cd dof-project-main-v2-react
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 7. Environment Configuration

### Backend Configuration
Create `.env` inside the `backend/` directory:

```env
# PostgreSQL connection mechanism via Prisma
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dof_db?schema=public"

# Auth configurations
JWT_SECRET="generate-a-secure-random-secret-key"
JWT_EXPIRES_IN="1d"

# Server bindings
PORT=5000

# Client origin for CORS rules
CLIENT_URL="http://localhost:5173"
```

---

## 8. Database Setup

### Creating the PostgreSQL Database
```sql
CREATE DATABASE dof_db;
```

### Applying Migrations & Seeding
Leverage Prisma to setup your database according to `schema.prisma`.

```bash
cd backend
# Deploy tables according to schema definition
npm run prisma:migrate

# Seed administrative and mock data
npm run seed
```

### Schema Architecture Overview
- **Users, Groups, & Memberships:** Mapped natively for fast access and role-based ACL.
- **Documents structure:** Complex tree mapping versions (`DocumentVersion`), sequential multi-stage approvals (`DocumentApproval`), complete audit trails (`DocumentLog`), distribution workflows (`DocumentDistribution`), and workload/timesheets (`DocumentWorkLog`).

---

## 9. Running the Application

### Running Local Development Environment

**Backend Environment (Terminal 1):**
```bash
cd backend
npm run dev      # Launches hot-reloading Express server on port 5000
```

**Frontend Environment (Terminal 2):**
```bash
cd frontend
npm run dev      # Launches Vite dev server on port 5173
```

### Creating Production Bundles
```bash
cd frontend
npm run build    # Assets generated in frontend/dist/
```

---

## 10. Authentication & Authorization

### RBAC (Role-Based Access Control) Model
1. **Regular User:** Can draft new documents, view documents owned/assigned/cc'd to them.
2. **Reviewer:** Gains ability to process documents in approval sequences, capable of passing forward or rejecting with annotations.
3. **Administrator:** System-wide rights to bypass read-blocks, manage organization taxonomies (groups, metadata), and distribute localized or global documents.

### Security Implementation
- **JWT (JSON Web Tokens):** Verified across all secure API boundaries.
- **Immutable State Enforcement:** The system imposes a strict 100% read-only lock dynamically when a `Document` state switches to "Disetujui" (Final) preventing even Admin alteration.

---

## 11. API Reference

All requests must carry the `Authorization: Bearer <TOKEN>` header unless labelled otherwise.

### Core Endpoints Preview
| Domain | Methods | Description |
|---|---|---|
| `/api/auth` | POST, GET | Handles token generation, profile access, and basic login |
| `/api/documents` | GET, POST, PUT | Document logic (fetching, creating permutations, version alterations) |
| `/api/documents/:id/approvals`| POST, PUT | Move document sequence up or register reject/revisions |
| `/api/users` | GET, POST, PUT, DEL| Management of credentials, titles, and hierarchical levels |
| `/api/groups` | GET, POST, PUT | Administrative sorting arrays for users |

---

## 12. Document Export & Printing

The system leverages browser-grade processing to convert real DOM layouts to digital physical counterparts without impacting Node.js performance.

- **Library Methodology:** `html2pdf.js` constructs high fidelity visual clones of documents loaded dynamically within React, directly porting DOM trees into scalable PDF outputs.
- **Print Layout Control:** System dynamically swaps print stylesheets alongside standard `window.print()` functionality to mask UI navigation shells and expose unadulterated document models.

---

## 13. Activity Logging & Auditing

Comprehensive, fail-safe auditing spans the lifecycle of almost every database mutation entity. 

- `document_logs` captures state machines, specific JSON-traced modification differences (like "Subject changed from [A] to [B]"), alongside actor tracking.
- `document_work_logs` functions to gather processing intervals & completion deltas.
- `document_versions` retains hard carbon copies (snapshots) of earlier iterables rendering modifications entirely restorable.

---

## 14. Production Deployment

### Recommended Ecosystem (PM2 & Nginx)

1. **Deploy Frontend:** Point Nginx root towards `frontend/dist`. Enable SPA routing rules (fallback to index.html).
2. **Process Management:**
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name "dof-backend" --env production
   pm2 save
   pm2 startup
   ```
3. **Reverse Proxy Hooks:** Connect Nginx to `/api` prefixes directing towards internal `localhost:5000`.

---

## 15. Active Directory / LDAP Integration

The ecosystem carries dependencies (`ldapts`) designed natively for enterprise credentialing handshakes. Adjust endpoints in `/api/auth` or the internal auth service controllers to pivot from standard PostgreSQL `users` verification to LDAP bindings, matching organizational AD Forests over `ldap://` or `ldaps://`.

---

## 16. Security Considerations

- Passwords rest inside PSQL instances encoded via `bcryptjs` algorithms.
- Hardened endpoints secured globally via `helmet`.
- `express-rate-limit` actively manages connection bursting, mitigating DDOS or brute-force attack vectors towards vulnerable `/auth` routes.
- Fully parameterized Prisma requests nullify traditional SQL Injection flaws.
