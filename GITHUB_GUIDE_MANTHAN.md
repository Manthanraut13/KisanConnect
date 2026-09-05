# GITHUB_GUIDE_MANTHAN.md
## Project Lead Git & GitHub Operations Manual
### Kisan Connect — SIH 2026

---

## YOUR ROLE IN ONE LINE
You are the only person who touches `main`. You review all PRs. You are the final gate before anything goes live.

---

## SECTION 1 — ONE-TIME SETUP (Day 1, Before Anyone Else Starts)

### 1.1 Create Repository

Go to GitHub → New Repository → Name: `kisan-connect` → Private → Create.

```bash
git clone https://github.com/YOUR_USERNAME/kisan-connect.git
cd kisan-connect

# Create folder structure
mkdir -p frontend backend ai-service database docs .github/workflows

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
__pycache__/
*.pyc
dist/
build/
.DS_Store
venv/
*.log
.venv/
EOF

# Create root README
cat > README.md << 'EOF'
# Kisan Connect — SIH 2026
## Problem Statement: SIH26033
Direct farm-to-consumer AI-powered marketplace.
EOF

git add .
git commit -m "chore: initial project structure and gitignore"
git push origin main
```

### 1.2 Create and Push `dev` Branch

```bash
git checkout -b dev
git push origin dev
```

### 1.3 Set Branch Protection Rules on GitHub

Go to: GitHub Repo → Settings → Branches

**Rule 1 — Protect `main`:**
- Branch name pattern: `main`
- Check: Require a pull request before merging
- Check: Require approvals → set to 1
- Check: Do not allow bypassing the above settings
- Save

**Rule 2 — Protect `dev`:**
- Branch name pattern: `dev`
- Check: Require a pull request before merging
- Check: Require approvals → set to 1
- Save

### 1.4 Add All Team Members as Collaborators

Go to: Settings → Collaborators → Add people

Add these GitHub usernames (get from each member):
- Siddhesh → Role: Write
- Tukesh → Role: Write
- Sunidhi → Role: Write
- Payal → Role: Write
- Pratham → Role: Write

### 1.5 Create GitHub Projects Board

Go to: GitHub → Projects → New Project → Board

Name: `Kisan Connect Sprint`

Columns to create:
- **Backlog**
- **In Progress**
- **In Review**
- **Done**

Create one card per module and assign to the right person:

| Card Name | Assigned To |
|---|---|
| Backend Auth + DB Setup | Manthan |
| Antigravity Workflows | Manthan |
| Admin API Endpoints | Manthan |
| AI Service Setup + Forecasting | Siddhesh |
| Route Optimization + Chatbot API | Siddhesh |
| Listing Module Backend | Tukesh |
| Orders + Payments Backend | Tukesh |
| Omniroute Configuration | Tukesh |
| Marketplace UI + Farmer Dashboard | Sunidhi |
| Create Listing Form + Advisory | Sunidhi |
| Home + Auth Pages | Payal |
| Cart + Checkout + Orders UI | Payal |
| Admin Dashboard UI | Pratham |
| Chatbot Widget | Pratham |
| Driver PWA | Pratham |

### 1.6 Share `.env.example` with Team

After setting up Supabase, Upstash, MSG91, Firebase, Gmail:

```bash
# Create backend/.env.example with all variable names but NO values
# Commit it
git add backend/.env.example
git commit -m "chore: add env example for team"
git push origin dev
```

Message everyone on WhatsApp with the actual values privately. Never put real values in the repo.

---

## SECTION 2 — YOUR DAILY GIT ROUTINE

### Every Morning

```bash
git checkout dev
git pull origin dev
git checkout feature/manthan/current-task
git merge dev
# Fix any conflict if shown (rare since you own the backend core)
```

### While Working

```bash
git add .
git commit -m "feat: add otp service with redis"
git push origin feature/manthan/current-task
```

### Your Branch Names

```
feature/manthan/setup-and-db
feature/manthan/auth-module
feature/manthan/notifications
feature/manthan/admin-api
feature/manthan/antigravity
```

Create a new branch for each major module. Do not put everything in one branch.

### Raising Your Own PR (to merge into dev)

Even as PM, your code goes through a PR to `dev`.
Since branch protection requires 1 approval and you cannot approve your own PR:

**Option A:** Ask Tukesh to do a quick review of your backend PRs and approve them.
**Option B:** Temporarily disable branch protection on `dev`, merge your PR, re-enable it.

Recommended: Use Option A. Tukesh reviews your backend PRs. You review his.

---

## SECTION 3 — WHO REVIEWS WHOSE PR

This is the fixed PR review assignment. No one reviews their own PR.

| PR Raised By | Reviewed By | Why |
|---|---|---|
| **Manthan** | Tukesh | Backend peer review; Tukesh knows the backend stack |
| **Siddhesh** | Manthan | AI service is critical; you verify endpoints match agreed contract |
| **Tukesh** | Manthan | Marketplace backend is core commerce; you verify business logic |
| **Sunidhi** | Payal | Frontend peers; Payal checks UI correctness and API calls |
| **Payal** | Sunidhi | Frontend peers; Sunidhi checks component structure and routing |
| **Pratham** | Manthan | Admin + Chatbot is high-visibility demo feature; you verify it works |

**Final merge to `dev`:** Only you (Manthan) click the merge button after approval is given.
**Final merge to `main`:** Only you (Manthan), only on demo day.

---

## SECTION 4 — HOW TO REVIEW A PR (Step by Step)

When someone raises a PR and messages you:

**Step 1:** Go to GitHub → Pull Requests → click the PR.

**Step 2:** Click **"Files changed"** tab.

**Step 3:** Check for these issues (reject if found):

| Issue | What to Look For | Action |
|---|---|---|
| Hardcoded URL | `http://localhost:5000` or `http://localhost:8000` in component | Request changes |
| .env committed | Any file named `.env` in the diff | Request changes immediately |
| API key in code | Any string starting with `sk-`, `gsk_`, `AIza`, `rzp_` | Request changes immediately |
| No error handling | `await apiCall()` with no try/catch | Request changes |
| Wrong branch target | PR targets `main` instead of `dev` | Close PR, ask to re-raise to `dev` |
| Console.log left in | `console.log(...)` in production code | Comment on line, request changes |

**Step 4:** If everything is fine:
- Click **"Review changes"** → Select **"Approve"** → Submit review.
- Click **"Squash and merge"** → Edit the commit message to something clean → **Confirm squash and merge**.
- Delete the source branch after merging (GitHub shows a button for this).

**Step 5:** Move the card on the Projects board to **"Done"**.

**Step 6:** Message the person: "PR merged. Pull from dev."

---

## SECTION 5 — HOW TO HANDLE MERGE CONFLICTS

You will see this on a PR: *"This branch has conflicts that must be resolved."*

**Do not resolve it yourself.** Message the person who raised the PR:

```
"Your PR has a merge conflict. Do this:
git checkout your-branch
git merge dev
Open VS Code, fix the conflict in the highlighted file
git add . && git commit -m 'fix: resolve merge conflict' && git push
Then check the PR again — it will update automatically."
```

If they are stuck, do a screen share and guide them through it. Takes 5 minutes.

### The Most Common Conflict File: `App.jsx`

**Prevention (tell Sunidhi to do this):**
Sunidhi owns `App.jsx`. When Payal or Pratham need a route added, they message Sunidhi with the import and route line. Sunidhi adds it. No conflict.

### The Second Most Common: `app.js` (Backend)

You own `backend/src/app.js`. When Tukesh finishes a new route file, he messages you:
```
"Add this to app.js:
app.use('/api/listings', require('./routes/listing.routes'));"
```
You add it in your next commit. No conflict.

---

## SECTION 6 — THE `dev` → `main` MERGE (DEMO DAY ONLY)

Only do this when:
- All PRs are merged into `dev`.
- You have tested the full user journey on the `dev` deployment.
- It is demo day or the night before.

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

This triggers the CI/CD GitHub Actions workflow to deploy to Vercel + Render.

---

## SECTION 7 — EMERGENCY SITUATIONS

### Someone Pushed Directly to `dev` or `main`

This will be blocked by branch protection. If they somehow bypassed it:

```bash
# Revert the last commit on dev
git checkout dev
git pull origin dev
git revert HEAD
git push origin dev
```

Message them: "Don't push directly to dev or main. Always use a PR."

### Someone Accidentally Committed `.env`

```bash
# Remove .env from git history (run in the affected service folder)
git rm --cached .env
git commit -m "fix: remove accidentally committed .env"
git push origin their-branch
```

Also: rotate (regenerate) any API keys that were exposed. Treat them as compromised.

### A Deployed Service is Broken After Merge

```bash
# Revert the merge commit on dev
git checkout dev
git pull origin dev
git revert -m 1 HEAD   # -m 1 means revert the merge, keep dev as parent
git push origin dev
```

Then investigate the issue in a feature branch and re-merge when fixed.

---

## SECTION 8 — YOUR PERSONAL COMMIT TARGETS BY DAY

| Day | Branch | What to commit |
|---|---|---|
| 1 | `feature/manthan/setup-and-db` | Repo structure, all Sequelize models, migrations confirmed |
| 2 | `feature/manthan/auth-module` | Full auth working, Postman tested, raise PR to dev |
| 3 | `feature/manthan/notifications` | Notification service, error middleware |
| 4 | `feature/manthan/admin-api` | All admin endpoints |
| 5 | `feature/manthan/antigravity` | All 3 Antigravity workflows live |
| 6 | `dev` | Backend deployed to Render, integration tested |
| 7 | `main` | Final stable build on demo day |

---

## SECTION 9 — QUICK COMMANDS YOU WILL USE MOST

```bash
# Pull latest dev into your branch (do every morning)
git checkout dev && git pull && git checkout - && git merge dev

# See what branches exist
git branch -a

# See all open PRs (GitHub CLI — optional install)
gh pr list

# Force push after rebase (only on your own feature branch, never dev/main)
git push --force origin feature/manthan/auth-module

# See what changed between dev and a branch
git diff dev..feature/siddhesh/ai-service

# Check who committed what recently
git log --oneline --graph --all -20
```

---

*This document is for Manthan's eyes only. Last updated: August 2026 | Kisan Connect SIH 2026*
