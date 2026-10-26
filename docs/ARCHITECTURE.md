# La Terra / Qubit - Architecture

## Structure
- `index.html`, `services.html`, `contact.html`, `login.html` - public pages
- `dashboard.html` - authenticated admin dashboard
- `css/` - existing design system + `dashboard.css`
- `js/firebase-config.js` - Firebase web app config (public, fill in your values)
- `js/firebase.js` - Firebase SDK bootstrap (CDN ES module, no build step)
- `js/modules/*` - navigation, footer, reveal, forms, auth, content, dashboard, particles
- `js/default-content.js` - seed data for the "Load default content" action
- `firestore.rules` - server-side security rules
- `firebase.json`, `.firebaserc` - Hosting + rules deployment
- `assets/` - images
- `data/` - legacy empty JSON placeholders (unused)
- `config/site.config.js` - legacy shared config (public modules no longer require it)

## Backend
Firebase (Spark/free plan is sufficient for a small site):
- **Firestore** - `site/main`, `services`, `contactMessages`, `consultations`
- **Authentication** - Email/Password; admin accounts created manually
- **Hosting** - `firebase deploy`
- **Security Rules** - public read for site/services, public create for forms,
  authenticated-only read/write for submissions and content

## Realtime flow
- `js/firebase.js` initializes `app`, `db`, `auth` and exposes
  `window.QubitFirebaseReady`.
- `js/modules/content.js` subscribes with `onSnapshot()` to `site/main` and
  `services`, updating public pages live. Hardcoded HTML remains as a fallback
  when the database is empty or unconfigured.
- `js/modules/forms.js` writes contact and consultation submissions with
  `addDoc()` and `serverTimestamp()`.
- `js/modules/auth.js` handles real sign-in, persistence, logout and redirects.
- `js/modules/dashboard.js` subscribes to all collections, manages submission
  statuses, deletes, service CRUD, site content editing, and seeding.

## Feature status
**Implemented:** real form storage, real login/logout, realtime dashboard,
realtime public content, service management, Firestore security rules,
Hosting config.

**Not implemented:** automated email notifications (needs Cloud Functions /
Blaze plan), password-reset flow, public registration, admin roles, file
uploads, dashboard pagination, App Check.

## Security notes
- The Firebase web config is public by design; protect data with rules.
- Never commit a service-account JSON key.
- Every signed-in account is currently an admin.

See `FIREBASE-UPGRADE-GUIDE.txt` for the full setup and deployment steps.
