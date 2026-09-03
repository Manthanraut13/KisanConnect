# GITHUB_GUIDE_TEAM.md
## Git & GitHub Instructions for All Team Members
### Kisan Connect — SIH 2026

---

## READ THIS FULLY BEFORE WRITING A SINGLE LINE OF CODE

This document tells you exactly how to use Git and GitHub while working on this project as a team. Follow it strictly. If you skip steps, you will break someone else's work.

---

## SECTION 1 — FIRST TIME SETUP (Do Once on Day 1)

### Step 1: Install Git
Download and install from: https://git-scm.com/downloads
After install, open Terminal (Mac/Linux) or Git Bash (Windows) and run:
```bash
git --version
# Should print something like: git version 2.43.0
```

### Step 2: Set Your Identity in Git
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your@email.com"
```

### Step 3: Clone the Repository
Manthan will share the GitHub repo link. Run:
```bash
git clone https://github.com/MANTHAN_USERNAME/kisan-connect.git
cd kisan-connect
```

### Step 4: Switch to the `dev` Branch
```bash
git checkout dev
git pull origin dev
```

### Step 5: Create YOUR Personal Branch
Replace `your-name` and `your-module` with your actual name and module.

```bash
# Format: feature/your-name/module-name
git checkout -b feature/your-name/your-module
```

**Each person's branch name:**
| Person | Branch Name |
|---|---|
| Siddhesh | `feature/siddhesh/ai-service` |
| Tukesh | `feature/tukesh/marketplace-backend` |
| Sunidhi | `feature/sunidhi/farmer-frontend` |
| Payal | `feature/payal/consumer-frontend` |
| Pratham | `feature/pratham/admin-chatbot-driver` |

Push your branch to GitHub immediately after creating:
```bash
git push origin feature/your-name/your-module
```

---

## SECTION 2 — EVERY SINGLE DAY ROUTINE

Do these commands every morning before you start writing code:

```bash
# Step 1: Go to dev branch
git checkout dev

# Step 2: Pull everyone's latest merged work
git pull origin dev

# Step 3: Go back to your branch
git checkout feature/your-name/your-module

# Step 4: Bring that latest work into your branch
git merge dev
```

If Step 4 shows a conflict, go to Section 5 of this document.

If Step 4 says "Already up to date." — perfect, start working.

---

## SECTION 3 — HOW TO SAVE AND UPLOAD YOUR WORK

After writing code, save it to GitHub like this:

```bash
# Step 1: See what files you changed
git status

# Step 2: Stage all your changes
git add .

# Step 3: Write a commit message describing what you did
git commit -m "feat: add demand forecast chart component"

# Step 4: Push to your branch on GitHub
git push origin feature/your-name/your-module
```

**Do this multiple times per day.** At minimum: once in the morning and once before you stop for the day. Treat it like hitting Save on a document.

### Commit Message Rules
Write a short description of what you did. Start with one of these words:

```
feat:   — new feature or component
fix:    — fixed a bug
chore:  — setup, install, config change
docs:   — only documentation changed
style:  — visual/CSS changes only
```

Examples:
```
feat: add product detail page with map
fix: cart quantity not updating on minus button
chore: install recharts and react-leaflet
feat: chatbot responds in hindi when language toggled
```

---

## SECTION 4 — HOW TO RAISE A PULL REQUEST (Submitting Your Work)

When you finish a chunk of work and want it merged into the project:

**Step 1:** Push your latest code:
```bash
git add .
git commit -m "feat: complete marketplace page"
git push origin feature/your-name/your-module
```

**Step 2:** Go to the GitHub repo in your browser.

**Step 3:** You will see a yellow bar saying *"your-branch had recent pushes"* → click **"Compare & pull request"**.

**Step 4:** On the PR creation page:
- **Base branch:** `dev` ← THIS MUST BE `dev` NOT `main`
- **Compare branch:** your feature branch
- **Title:** `[YourName] Short description` → Example: `[Sunidhi] Marketplace page and ProductCard component`
- **Description:** Write what you built in 3–5 bullet points.

**Step 5:** Click **"Create pull request"**.

**Step 6:** Message Manthan on WhatsApp: "PR raised, please review."

### Who Reviews Whose PR

| PR Raised By | Reviewed and Merged By |
|---|---|
| **Siddhesh** | **Manthan** — He verifies all AI endpoints match the agreed API contract |
| **Tukesh** | **Manthan** — He verifies business logic, commission math, Razorpay flow |
| **Sunidhi** | **Payal** — She checks UI correctness, API calls, and routing |
| **Payal** | **Sunidhi** — She checks component structure, cart logic, Razorpay integration |
| **Pratham** | **Manthan** — He verifies chatbot works and admin pages call correct endpoints |
| **Manthan** | **Tukesh** — Tukesh does a backend peer review and approves |

**After approval:** Manthan clicks the final merge button. You do not merge your own PR.

---

## SECTION 5 — MERGE CONFLICTS (How to Fix Them)

A merge conflict happens when you and someone else both edited the same file. Git cannot decide which version to keep, so it asks you to decide.

You will see this message in your terminal:
```
CONFLICT (content): Merge conflict in src/App.jsx
Automatic merge failed; fix conflicts and then commit the result.
```

### How to Fix It

**Step 1:** Open VS Code. In the left sidebar, files with conflicts show a red **U** or **C** icon.

**Step 2:** Click the conflicted file. You will see something like this:

```
<<<<<<< HEAD
// Your code
const MyRoute = () => <div>My Page</div>;
=======
// Code from dev (someone else's code)
const TheirRoute = () => <div>Their Page</div>;
>>>>>>> dev
```

**Step 3:** Decide what the final code should look like. Usually you KEEP BOTH — combine them:

```javascript
// Keep both routes
const MyRoute = () => <div>My Page</div>;
const TheirRoute = () => <div>Their Page</div>;
```

Delete the `<<<<<<<`, `=======`, and `>>>>>>>` lines completely. Save the file.

**Step 4:**
```bash
git add .
git commit -m "fix: resolve merge conflict in App.jsx"
git push origin feature/your-name/your-module
```

The PR on GitHub automatically updates. Message Manthan that conflict is resolved.

### How to Avoid Conflicts (Prevention)

- Pull from `dev` every single morning (Section 2).
- If you need to edit a file someone else owns, message them first.

**File ownership — who owns what:**

| File | Owner | What to Do If You Need to Edit It |
|---|---|---|
| `frontend/src/App.jsx` | Sunidhi | Message Sunidhi with your route line — she adds it |
| `backend/src/app.js` | Manthan | Message Manthan with your route file name — he registers it |
| `frontend/src/services/api.js` | Sunidhi | Ask Sunidhi before changing |
| `frontend/src/stores/authStore.js` | Sunidhi | Ask Sunidhi before changing |
| `backend/src/middleware/auth.middleware.js` | Manthan | Do not edit — ask Manthan |
| `package.json` (frontend) | Sunidhi | Message Sunidhi before adding packages |
| `package.json` (backend) | Manthan | Message Manthan before adding packages |

---

## SECTION 6 — RULES YOU MUST NEVER BREAK

```
❌ NEVER push directly to main or dev
   Always push to your feature branch only

❌ NEVER commit a .env file
   If you accidentally do: message Manthan immediately

❌ NEVER put API keys, passwords, or secrets in code
   Use process.env.VARIABLE_NAME (backend) or import.meta.env.VITE_VARIABLE (frontend)

❌ NEVER hardcode localhost URLs
   Wrong:  axios.get('http://localhost:5000/api/listings')
   Right:  axios.get(`${import.meta.env.VITE_API_URL}/api/listings`)

❌ NEVER merge your own PR
   Raise it and message your reviewer

❌ NEVER push to someone else's branch
   Only push to feature/your-name/...
```

---

## SECTION 7 — SPECIFIC INSTRUCTIONS PER PERSON

### Siddhesh
- Your branch: `feature/siddhesh/ai-service`
- Work inside: `ai-service/` folder only
- Do NOT touch `backend/` or `frontend/`
- When your Railway deployment URL is ready: share it in WhatsApp group immediately — Tukesh and Sunidhi need it
- Your PR is reviewed by: **Manthan**

### Tukesh
- Your branch: `feature/tukesh/marketplace-backend`
- Work inside: `backend/src/` — specifically routes, controllers, services for listings/orders/payments/logistics
- Do NOT touch files Manthan owns: `auth.controller.js`, `app.js`, any model files
- Once Omniroute URL is live: share in WhatsApp group — Sunidhi, Payal, Pratham all need it for `VITE_API_URL`
- Your PR is reviewed by: **Manthan**

### Sunidhi
- Your branch: `feature/sunidhi/farmer-frontend`
- Work inside: `frontend/src/` — you own `App.jsx`, `api.js`, `authStore.js`
- When Payal or Pratham need routes added to App.jsx: they message you, you add them in your next commit
- Your PR is reviewed by: **Payal**
- After Payal approves: Manthan does final merge

### Payal
- Your branch: `feature/payal/consumer-frontend`
- Work inside: `frontend/src/` — your pages and components only
- For any route you need in App.jsx: message Sunidhi with the exact import and Route line
- Your PR is reviewed by: **Sunidhi**
- After Sunidhi approves: Manthan does final merge

### Pratham
- Your branch: `feature/pratham/admin-chatbot-driver`
- Work inside: `frontend/src/` — admin pages, chatbot component, driver pages
- For any route you need in App.jsx: message Sunidhi with the exact import and Route line
- The ChatbotWidget import in App.jsx: message Sunidhi to add `<ChatbotWidget />` at the bottom of App's return
- Your PR is reviewed by: **Manthan**

---

## SECTION 8 — QUICK REFERENCE COMMANDS

```bash
# Morning start
git checkout dev && git pull origin dev && git checkout feature/your-branch && git merge dev

# Save work (do multiple times a day)
git add . && git commit -m "feat: your message" && git push origin feature/your-branch

# Check what changed
git status

# See your commit history
git log --oneline -10

# Undo last commit (keeps your changes, just undoes the commit)
git reset --soft HEAD~1

# Discard ALL local changes and go back to last commit (careful — cannot undo)
git checkout -- .

# See difference between your branch and dev
git diff dev
```

---

## SECTION 9 — WHAT TO DO WHEN SOMETHING BREAKS

| Problem | What to Do |
|---|---|
| "Permission denied" on push | You are trying to push to `main` or `dev`. Switch to your branch first. |
| "Your branch is behind" on push | Run `git pull origin your-branch` first, then push |
| Conflict after `git merge dev` | Follow Section 5 of this document |
| You committed to wrong branch | Message Manthan immediately |
| You committed `.env` | Message Manthan immediately, do not push |
| You pushed something wrong | Message Manthan — he will revert it |
| GitHub shows "Can't merge — conflicts" on PR | Follow Section 5, then update your branch |

---

## SECTION 10 — DAILY CHECKLIST FOR EVERY TEAM MEMBER

Every day before starting:
- [ ] Pulled from dev into my branch
- [ ] No conflicts after merge

Every day before stopping:
- [ ] Committed all changes with a clear message
- [ ] Pushed to my branch on GitHub
- [ ] Updated my card on the GitHub Projects board
- [ ] If I finished a module: raised a PR and messaged my reviewer

---

*Version 1.0 | Kisan Connect SIH 2026 | For: Siddhesh, Tukesh, Sunidhi, Payal, Pratham*
