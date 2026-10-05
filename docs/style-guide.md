# ClientDesk Style Guide

> The team is using **Firebase** for authentication and data, deploying on **Vercel**, and using the agreed work split.

Everything in this guide has been agreed by the team.

## Quick Glossary

<details>
<summary>Click to open (read this first if any terms are new)</summary>

- **Server component:** a React component that runs on the server, not in the user's browser. It can safely talk to the database. It can't use `useState`, `onClick`, etc.
- **Client component:** a normal React component that runs in the browser. Starts with `"use client"`. Needed for anything interactive.
- **Server action:** a function that runs on the server, but you can call it from a form or button like a normal function. We use these for anything that _changes_ data (create, update).
- **Firestore:** Firebase's database. Data is stored as "documents" inside "collections" (like files in folders) instead of tables.
- **Firebase Admin SDK:** the server-only version of Firebase. It has full access to the database, so it must never run in the browser.
- **Session cookie:** a small secure token the browser holds after login so the server knows who you are. "HTTP-only" means JavaScript in the browser can't read it, so it can't be stolen by bad scripts.
- **Proxy (`proxy.ts`):** a file that runs before every page loads. Next.js 16 renamed "middleware" to "proxy". We use it to send logged-out users to the login page.
- **Zod:** a library that checks data is the right shape (e.g. "email must be a valid email") before we use it.
- **Security Rules:** Firebase's own rules about who can read/write what. A safety net in case our code has a bug.
- **PR (Pull Request):** asking the team to review your code before it goes into `main`.

</details>

---

## 1. Tech Stack

> These are the tools we're all using. No swapping things out without a team decision.

| Area             | Choice                                                         |
| ---------------- | -------------------------------------------------------------- |
| Language         | TypeScript (strict mode)                                       |
| Framework        | Next.js 16, App Router                                         |
| Styling          | Tailwind CSS                                                   |
| Login / accounts | Firebase Authentication                                        |
| Database         | Cloud Firestore                                                |
| Hosting          | Vercel                                                         |
| Starting code    | Firebase + Next.js base implementation in the project repository |
| Comment images   | Firebase Storage                                               |
| Form/data checks | Zod                                                            |
| Code formatting  | ESLint + Prettier (auto-format on save)                        |

**Bonus of Firebase:** it sends account emails (password setup, password reset) for free, so we don't need a separate email service like Resend for the client invite flow.

---

## 2. Where Files Go

> Everyone puts the same kind of file in the same place, so you always know where to look.

```
src/
  app/                    // pages (each folder = a URL)
    auth/                 // login, signup, activate account
    developer/            // developer dashboard, clients, requests
    client/               // client dashboard, requests, new request
  components/
    ui/                   // generic pieces: Button, Card, Modal, EmptyState
    features/             // ClientDesk pieces: RequestCard, CommentThread
  hooks/                  // custom React hooks (useSomething)
  lib/
    firebase/client.ts    // browser Firebase (login only)
    firebase/admin.ts     // server Firebase (database access)
    data/                 // functions that READ from the database
    actions/              // functions that CHANGE the database
    validation/           // Zod checks
  types/                  // TypeScript types for our data
```

Only one page uses a component? Keep it next to that page. Once a second page needs it, move it to `components/`.

---

## 3. Naming Things

> Use the same naming everywhere so code looks consistent.

| What                          | Style                                                            | Example                                                |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| File & folder names           | kebab-case                                                       | `request-card.tsx`                                     |
| Components & types            | PascalCase                                                       | `RequestCard`, `WorkRequest`                           |
| Functions & variables         | camelCase                                                        | `getClientRequests`                                    |
| Constants                     | UPPER_SNAKE_CASE                                                 | `MAX_IMAGE_SIZE_MB`                                    |
| True/false values             | start with is / has / can                                        | `isActive`, `canEdit`                                  |
| Database collections & fields | camelCase, plural collections                                    | `workRequests`, `submittedAt`                          |
| Import paths                  | Use the `@/` alias for imports within `src`; avoid deep relative paths | `import { Component } from '@/components/Component'` |
| Status values saved in the DB | lowercase snake_case                                             | `awaiting_approval`                                    |

**Why lowercase statuses?** The database saves `awaiting_approval`, and one shared file turns it into "Awaiting Approval" for the screen. That way a typo like "Awaiting approval" vs "Awaiting Approval" can't break a filter.

**Import paths:** Use the `@/` alias for imports within `src`, for example `import { Component } from '@/components/Component'`. Use relative imports only when they improve readability for closely related local files. Avoid long paths such as `../../../../components/Component`.

---

## 4. Server vs Client Components

> Pages load their data on the server. Only the small interactive bits (buttons, toggles, modals, forms) run in the browser.

1. Every page starts as a **server component**. That's the default, you don't write anything special.
2. Add `"use client"` at the top of a file **only** if it needs `useState`, `useEffect`, `onClick`, or other browser stuff.
3. Keep client components **small**. The page gets the data, then hands it to the interactive piece as props.
4. Custom hooks go in `src/hooks/` and are only used inside client components.
5. **Never** import `lib/firebase/admin.ts` or anything in `lib/data/` into a client component. Those files start with `import "server-only"`, so the build will error if someone slips up.

**Example:** the Requests page (server) loads the list of requests. The "Show completed" toggle is a tiny client component sitting inside it.

---

## 5. Reading and Changing Data

> There's one way to read from the database and one way to save to it. Don't write database code inside pages or components.

### Reading data

Write a function in `lib/data/`, then call it from a server component.

```ts
// lib/data/work-requests.ts
import "server-only";
export async function getRequestsForDeveloper(developerId: string) { ... }
```

### Changing data (create / update / delete)

Write a **server action** in `lib/actions/`. Every action does the same 4 steps, in order:

1. **Who's asking?** Get the logged-in user. Not logged in → stop.
2. **Is the input OK?** Check it with Zod. Bad input → stop.
3. **Are they allowed?** e.g. is this developer the owner of this client? Not allowed → stop.
4. **Save it**, then refresh the page's data with `revalidatePath()`.

### What actions send back

Actions **never crash the page**. They always return one of two things:

```ts
{ ok: true, data: ... }                       // it worked
{ ok: false, error: "Email already in use" }  // it didn't, here's why
```

The UI shows `error` to the user. A lot of our tasks say "display an appropriate error message", and this is how we do it.

### Dates

Firestore stores dates in its own format. Convert them to normal date strings inside `lib/data/` before handing them to components.

### Live updates

Only if we have time at the end: live comments and the navbar notification count. Everything else just loads when the page loads.

---

## 6. Login and Who Can See What

> The base implementation handles login securely. Add a check before every page, plus database rules as a backup.

- **Login:** already done in the base implementation. After login, the browser gets a secure session cookie.
- **Roles:** every user is either a `developer` or a `client`, saved on their account so we can check it quickly.
- **The proxy (`proxy.ts`):** runs before every page. Logged out → sent to login. Client trying to open a developer page (or vice versa) → sent to their own dashboard.
- **Data ownership:** a developer only sees _their_ clients and requests. A client only sees _their own_ requests. Check this in step 3 of every server action.
- **Security Rules:** Firebase rules live in the repo (`firestore.rules`) and get reviewed in PRs. Hiding a button is not security, the rules are the real lock.
- **Testing:** Authentication should be testable. Use the Firebase Emulator (a fake local Firebase) so tests don't touch real data.
- **Client invites:** developer creates the client (`status: invited`), Firebase emails the client a link, the client sets their password, and status becomes `active`. The link only works once.

---

## 7. Look and Feel

> Define colors and sizes in one place. Nobody types random hex codes into components.

- **Font:** Roboto, loaded with `next/font`.
- **Colors:** muted/pastel. Defined once as theme colors (`primary`, `surface`, etc.) and used as Tailwind classes like `bg-primary`. **No `#hex` codes in components.**
- **Corners:** rounded. `rounded-xl` for cards and modals, `rounded-lg` for buttons and inputs.
- **Tailwind only:** no CSS files, no inline `style={{}}`. If the class list gets huge, make it a component.
- **Empty states:** every list (clients, requests, comments) shows a friendly message when it's empty. Use the shared `EmptyState` component.
- **Mobile first:** build for small screens first, then add bigger-screen styles. The release task requires it working on all screen sizes.
- **Dark mode, color settings, payments: after MVP only.** Using theme colors now means dark mode is easy to add later.

---

## 8. Working in GitHub

> Never push straight to `main`. Make a branch, open a PR, and get someone to look at it first.

1. Pull the latest `main` before you start each day.
2. Make a branch for your task: `feature/user-login`, `fix/signup-error-message`.
3. Commit messages start with a type: `feat:` (new thing), `fix:` (bug), `refactor:` (cleanup), `chore:` (setup stuff), `docs:` (notes). Example: `feat: add developer signup form`.
4. Open a PR and link the ClickUp task in it.
5. **At least 1 teammate reviews before merging.** The team will use peer review until a senior FES developer joins.
6. PR checklist: run the repository's lint and type checks, confirm there are no leftover `console.log` statements, test as both developer and client when relevant, and add screenshots for UI changes.
7. Squash and merge (all your commits become one clean commit on `main`).

### Running the checks

Check `package.json` first because the exact commands depend on the repository setup. The expected scripts are:

```bash
npm run lint
npm run typecheck
```

If a `typecheck` script has not been added yet, use:

```bash
npx tsc --noEmit
```

Editor or Copilot warnings are useful while coding, but they do not replace running the project's checks before opening a PR. Add the lint and type-check commands to the repository scripts, then automate them in GitHub Actions when the project setup is stable.

**Secrets:** the `.env` file with Firebase keys **never** gets committed to GitHub. Share it privately, not in the team channel.

---

## 9. Team Updates

> Short check-ins keep the team informed about progress.

- **Daily update:** if you're working on a task today, post a short update in ClickUp. What you're doing and roughly how long it'll take.
- **Problems or delays:** say something **right away**, with what's wrong and how long it might push things back.
- Move your ClickUp task to **in progress** when you start, and link your PR in it.
- **Stick to MVP.** Extras only once the required stories are done.

---

## 10. Who's Doing What

| Phase                 | Pair A                                                     | Pair B                                                                     |
| --------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1 Foundation & Access | Developer Registration, Login, Logout, Protected Access    | App shell (layout, nav, theme, shared components), Client Account Creation |
| 2 Core Requests       | Submit Request, View Requests (as Client)                  | View Clients, View Client Requests (as Developer)                          |
| 3 Request Workflow    | Define Proposed Work, Review & Respond to Proposed Work    | Request Comments, Filter Requests by Status, Update Request Status         |
| 4 Release             | Everyone: integration, testing, release                    | Everyone: integration, testing, release                                    |

Each pair reviews the other pair's PRs. First target: **Developer Account Registration done by end of Tuesday 10/6.**

---

## 11. Database Model Updates

> These database updates have been agreed.

- Add a `declineReason` field to `workRequests`, since a developer has to give a reason when declining.
- Comments are **add-only**: you can't edit or delete them in the MVP.
- All status values are lowercase snake_case (`open`, `awaiting_approval`, `declined`, `invited`, `active`).
