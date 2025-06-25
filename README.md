# Ajokunto.fi

Auton kunnon läpinäkyvyys platform. Jokaisen ajoneuvon kestävä "autoprofiili" kokoaa tarkastustiedot, huoltohistorian, löydökset ja dokumentit.

## MVP Features

✅ **Complete MVP Implementation** with all core functionality:

- 🔐 **Authentication** - Email signup/login with Supabase Auth
- 📊 **User Dashboard** - Role-based car management (owner/contributor/viewer)
- 🚗 **Car Profiles** - Complete vehicle information and history
- 📋 **Comprehensive Inspection Checklist** - 75 professional inspection questions across 8 categories
- 🔧 **Permissions System** - Granular access control and collaboration
- 📁 **Media Management** - Upload and organize images, videos, PDFs, audio
- 📄 **PDF Export** - Generate professional inspection reports
- 🌍 **Internationalization** - Full Finnish/English language support

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui
- **Auth + DB + Storage**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Internationalization**: next-intl

## Inspection Checklist

The system includes 75 comprehensive inspection questions across 8 categories:

- 📄 **Dokumentaatio** (22 items) - Vehicle documentation, history, legal checks
- 🚗 **Ulkopuoli** (8 items) - Exterior condition, paint, body, tires
- 🛋️ **Sisätilat** (3 items) - Interior condition and electrical systems
- 🔧 **Tekniset tarkistukset** (5 items) - Battery, brakes, diagnostics
- 🛣️ **Koeajo** (14 items) - Test drive functionality checks
- 🧪 **Erityistarkastukset** (2 items) - Professional expert inspection
- 💰 **Kustannusarviot** (3 items) - Cost estimates and insurance
- 📌 **Ostoneuvot** (7 items) - Buyer advice and final checks

## Getting Started

1. **Quick setup**:
```bash
npm run setup  # Shows complete setup instructions
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment setup**:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Database setup**:
   - Create a Supabase project
   - Run SQL from `supabase-schema.sql`
   - Run SQL from `supabase-functions.sql` 
   - Create storage bucket "car-media"

5. **Start development**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/[locale]/          # Next.js App Router with i18n
├── components/            # Reusable UI components
├── data/                  # Checklist items and data structures
├── lib/                   # Utility libraries (Supabase, auth, storage)
└── utils/                 # Helper functions

locales/
├── fi.json               # Finnish translations
└── en.json               # English translations

Database files:
├── supabase-schema.sql    # Complete database schema with RLS
├── supabase-functions.sql # Helper functions for permissions
└── DEPLOYMENT.md          # Production deployment guide
```

## Key Features Detail

### 🔐 Authentication & Security
- Secure email-based authentication via Supabase Auth
- Row-level security (RLS) for all database operations
- Session management and protected routes

### 📊 Dashboard & Car Management
- View all cars with appropriate permissions
- Role-based access: Owner, Contributor, Viewer
- Add new vehicles with registration details

### 📋 Professional Inspection System
- 75 comprehensive inspection questions based on industry standards
- Status tracking (OK/Warning/Issue) for each item
- Individual comments and media attachments
- Collapsible sections with progress tracking

### 🔧 Collaboration & Permissions
- Invite users via email to car profiles
- Granular permission management
- Real-time collaboration on inspections

### 📁 Media Management
- Upload images, videos, PDFs, audio files
- Associate media with specific checklist items
- File type and size validation
- Secure storage via Supabase Storage

### 📄 Professional Reporting
- Generate comprehensive PDF inspection reports
- Include all findings, media references, and metadata
- Buyer/seller approval sections for legal use
- Professional formatting suitable for transactions

### 🌍 Internationalization
- Complete Finnish and English language support
- Structured translation system with next-intl
- Easy to extend to additional languages