# GitHub Setup — one-time, maintainer only

Everything the repository *files* need is already in this branch. This document
is the **settings** half: the switches that make the rules in
[TEAM_PLAYBOOK.md](TEAM_PLAYBOOK.md) enforceable instead of aspirational.

**Who:** @Raufnarejo505 (you have admin on the repo).
**How long:** about 25 minutes, done once, before the first real PR.
**Order matters** — do steps 1–5 in sequence.

> Repo URL prefix used below:
> `https://github.com/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace`

---

## Step 0 — Check the team has write access

`Setings → Collaborators` (URL: `…/settings/access`)

| Person | Role |
| --- | --- |
| @Raufnarejo505 | Admin |
| @masoodamd | **Write** |
| @ZahidWebS | **Write** |

Write is required: without it, CODEOWNERS reviews cannot be requested and
assignees cannot be set. `Read` is not enough and is a very common mis-set.

---

## Step 1 — Merge strategy

`Settings → General → Pull Requests`
(URL: `…/settings`)

| Toggle | Set to | Reason |
| --- | --- | --- |
| Allow merge commits | **off** | Keeps `develop` linear and readable |
| Allow squash merging | **on** | One PR = one commit; this is our only merge path |
| Allow rebase merging | **off** | Ambiguous history for beginners, and it silently rewrites SHAs |
| Default commit message for squash | **Pull request title** | Makes the PR title the commit subject, which is why the title format matters |
| Always suggest updating pull request branches | **on** | Prompts the author to rebase before CI runs |
| Automatically delete head branches | **on** | No stale-branch graveyard |
| Allow auto-merge | **on** | Lets a reviewed PR merge itself when CI finishes |

Under **Merge button**, also confirm **Default to pull request title** is
selected — otherwise squash messages inherit 12 noisy commit subjects.

---

## Step 2 — Branch protection

`Settings → Branches → Add branch protection rule`
(URL: `…/settings/branches`)

Create **two rules**, identical, for `main` and `develop`.

### Rule 1: `main`

**Branch name pattern:** `main`

| Section | Setting | Value |
| --- | --- | --- |
| Protect matching branches | Require a pull request before merging | ✅ |
| | → Required approvals | **1** |
| | → Dismiss stale approvals when new commits are pushed | ✅ |
| | → Require review from Code Owners | ✅ |
| | → Require approval of the most recent reviewable push | ✅ |
| | Require status checks to pass | ✅ |
| | → Require branches to be up to date before merging | ✅ |
| | → Status checks | `backend`, `frontend` (see note) |
| | Require conversation resolution before merging | ✅ |
| | Require linear history | ✅ |
| | Require signed commits | ✗ (nice-to-have, skip for now) |
| | Require deployments to succeed | ✗ |
| | Lock branch | ✗ |
| | Do not allow bypassing the above settings | ✅ |
| | Restrict who can push | ✗ |
| Rules applied to everyone | Allow force pushes | ✗ |
| | Allow deletions | ✗ |

### Rule 2: `develop`

Same pattern → `develop`, **same settings**, except:

- **Required approvals: 1** (same as main — with three people, 2 is
  operationally impossible when the author cannot self-approve)

> **Why "Require linear history" matters here.** It is the switch that forbids
> merge commits on the branch. Combined with squash-only merging in Step 1, it
> writes our merge policy into the server rather than into a convention nobody
> enforces.

> **Gotcha — the status check list is empty at first.** The `backend` and
> `frontend` check names only appear in that dropdown *after the CI workflow has
> run at least once on the branch*. So: push this branch first, let CI run, then
> come back and select the checks. If you set protection before the first run,
> you will be stuck with a half-configured rule.

> **What this actually blocks:** direct pushes to `main`/`develop` (including
> yours as admin), force-pushes, branch deletion, merging with red CI, and
> merging with no approval. That is the whole point — the process stops being
> something you have to remember.

---

## Step 3 — Actions permissions

`Settings → Actions → General`
(URL: `…/settings/actions`)

| Setting | Value |
| --- | --- |
| Actions permissions | Allow all actions and reusable workflows |
| Workflow permissions | **Read repository contents** (default is read-write — tighten it) |
| Allow GitHub Actions to create and approve pull requests | ✗ off |

Nothing in our CI writes anything, so least privilege costs us nothing.

---

## Step 4 — Security

`Settings → Code security and analysis`
(URL: `…/settings/security_analysis`)

| Feature | Enable | Note |
| --- | --- | --- |
| Dependabot alerts | ✅ | Free on public repos |
| Dependabot security updates | ✅ | Auto-PRs for vulnerable deps — a great "small PR" exercise |
| Dependabot version updates | ✗ | Too noisy for a 3-week run; enable later |
| Code scanning (CodeQL) | ✅ default setup | Catches the kind of thing a student review always misses |
| Secret scanning | ✅ | Public repos get it free; **push protection** too |

> Secret scanning will stop the classic accident: an `.env` file with
> `JWT_SECRET` committed at 1 a.m. Turn on **Push protection**, not just
> "alerts after the fact".

---

## Step 5 — Create the labels, milestones and issues

The files are in this branch. From the repository root:

```powershell
# one-time
winget install --id GitHub.cli          # if gh is not installed
gh auth login                            # choose GitHub.com → HTTPS → browser

# create labels, 3 sprint milestones + v1.1.0, and all 25 issues
pwsh ./scripts/bootstrap-github.ps1 -DryRun   # preview first — always
pwsh ./scripts/bootstrap-github.ps1
```

`-DryRun` prints what it *would* create without touching GitHub. Run it once
without the flag after the preview looks right.

The script prints an ID → issue-number map at the end (`A1 → #31`). Keep it;
the docs reference `A1`-style IDs.

### Labels created

| Group | Labels |
| --- | --- |
| Type | `type/feature` `type/bug` `type/chore` `type/docs` `type/test` `type/security` |
| Area | `area/backend` `area/frontend` `area/db` `area/realtime` `area/devops` |
| Size | `size/S` `size/M` `size/L` |
| Priority | `P0` `P1` `P2` |
| Flow | `needs-triage` `blocked` `good first issue` `accessibility` |

Existing GitHub default labels (`bug`, `documentation`, `enhancement`, …) stay —
the new ones are additive, so older links keep working.

### Milestones created

| Milestone | Due | Contains |
| --- | --- | --- |
| `Sprint 1 - Foundations` | +7 days | A1–A4, B0, B1, C0, C1 |
| `Sprint 2 - Features` | +14 days | A5, A6, B2, B4, C2, C3 |
| `Sprint 3 - Release v1.1.0` | +21 days | A7, B3, B5, C4, C5, C6, X1–X5 |

Milestone titles are ASCII on purpose: `scripts/issues.json` is parsed by
Windows PowerShell 5.1, and non-ASCII there is a silent encoding trap.

---

## Step 6 — Project board

`Projects → New project → Board`

- **Name:** `AgriMatch Roadmap`
- **Columns:** `Backlog` · `Ready` · `In progress` · `In review` · `Done`
- **Custom fields:** `Track` (single select: A / B / C / X) · `Sprint`
  (Sprint 1/2/3) · `Size` (S/M/L)
- **Workflow automations** (built-in, worth turning on):
  - Issue created → `Backlog`
  - Issue assigned → `Ready`
  - PR opened or marked ready → `In review`
  - PR merged / issue closed → `Done`

Link it from the repo sidebar with `Projects → Link a project`.

> This board is not busywork — it is the single clearest screenshot of
> "we ran a process" for the final report. Set the automation up and forget it.

---

## Step 7 — Small polish worth two minutes

| Where | Change |
| --- | --- |
| `Settings → General → Features` | Enable **Discussions** (the issue template links to it) |
| Repo home → gear icon next to *About* | Description already good; add a website or demo link if you have one |
| Topics | Already set: `agriculture fastapi nextjs websocket marketplace` |
| `Settings → General → Danger Zone` | Do **not** rename branches here — protection rules would need recreating |

---

## Step 8 — Clean up the existing branches

Seven branches are fully merged into `develop` and are just clutter:

```
chore/docs-and-ci        feature/admin-dashboard    feature/backend-foundation
feature/frontend-foundation  feature/marketplace    feature/realtime-negotiation
fix/release-hardening
```

Delete them at `…/branches` (trash icon). Or:

```bash
git fetch --prune
for b in chore/docs-and-ci feature/admin-dashboard feature/backend-foundation \
         feature/frontend-foundation feature/marketplace \
         feature/realtime-negotiation fix/release-hardening; do
  git push origin --delete "$b"
done
```

Also sync the two long-lived branches — `main` is 2 commits ahead of `develop`
(the v1.0.0 release merge plus the README commit) and `develop` is 0 ahead:

```bash
git switch develop && git pull
git merge origin/main --ff-only     # or open a back-merge PR
git push
```

Third-party tooling note: `gh api -X PUT repos/{owner}/{repo}/branches/main/protection`
exists, but configuring protection through the UI once means you understand what
each switch does. Do it by hand, once.

---

## Day-1 verification

Ten minutes of proof that the setup is real. Run these from a teammate's
account, not yours:

- [ ] `git push origin develop` directly → **rejected** by branch protection
- [ ] Open a throwaway PR → GitHub asks for a review; merging is greyed out
- [ ] Submit a PR with a failing test → merge blocked by the `backend` check
- [ ] On a PR, the `code owners` box shows the owner of the touched files
- [ ] Resolve nothing on an unresolved thread → merge blocked
- [ ] Merge a PR → confirm it is a **single squash commit** on `develop` and the
      branch is auto-deleted
- [ ] Close an issue via `Closes #N` → it closes on merge
- [ ] The Project board moved the card to `Done` on its own

If all eight pass, the process is running on rails and nobody has to enforce it
by hand for the next three weeks.

---

## When something goes wrong

| Symptom | Cause | Fix |
| --- | --- | --- |
| "Required status check `backend` is expected" on a docs-only PR | CI path filters skipped the job | Remove path filters from `ci.yml`, or add a no-op job. Simplest: run all jobs always |
| Branch protection won't let *me* merge as admin | "Do not allow bypassing" is on | That is intentional. Get a review; temporary disable only in an emergency, and say so in the PR |
| CODEOWNERS review never gets requested | Owner lacks write access, or the file is on the wrong branch | CODEOWNERS only takes effect on the branch it is committed to (so: `develop`, then `main` after release). Check `Settings → Collaborators` |
| Squash commit has a 12-line message | Author didn't edit the squash body | Fix forward; note it in the retro |
| Dependabot opens 40 PRs | Version updates got switched on | Limit it with a `.github/dependabot.yml` allow-list, or switch it off |
