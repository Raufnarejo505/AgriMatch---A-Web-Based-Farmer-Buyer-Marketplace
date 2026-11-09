# Contributing to AgriMatch

This repository is run the way a small production team runs one: every change
starts as an **issue**, travels on a **branch**, is reviewed in a **pull
request**, and lands through a **squash merge**. Nothing is pushed straight to
`main` or `develop` — branch protection enforces this.

If you are new here, read the four documents below in order. They take about
fifteen minutes and they are the whole contract.

| Document | What it answers |
| --- | --- |
| [docs/TEAM_PLAYBOOK.md](docs/TEAM_PLAYBOOK.md) | The rules: branches, commits, PRs, reviews, merging, conflicts. |
| [docs/TASK_ASSIGNMENT.md](docs/TASK_ASSIGNMENT.md) | Who owns which area, and the 3-week delivery plan. |
| [docs/BACKLOG.md](docs/BACKLOG.md) | Every open piece of work, prioritised. |
| [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) | One-time repository settings (maintainer only). |

---

## The 60-second version

```bash
# 1. sync
git switch develop
git pull

# 2. branch from develop, named after the issue
git switch -c feat/12-refresh-tokens

# 3. work in small commits
git add .
git commit -m "feat(auth): add refresh token model"

# 4. push and open the PR against develop
git push -u origin feat/12-refresh-tokens
```

Then on GitHub: fill in the PR template, request a reviewer, wait for CI to go
green, get one approval, **squash-merge**, delete the branch.

---

## Non-negotiables

1. **Never commit to `main` or `develop`.** Branch protection blocks it anyway;
   the automation is a backstop for the habit, not a substitute for it.
2. **One concern per PR.** If your diff touches an unrelated file, move it to
   another PR.
3. **Keep PRs under ~400 changed lines.** Larger changes get split. Reviewers
   may reject oversized PRs on sight.
4. **Every PR closes an issue** (`Closes #12`) unless it is the weekly release
   PR.
5. **Every PR gets one approval from someone who is not the author**, and that
   reviewer must not be you. With three people the pairing rotates.
6. **CI must be green before merge.** Red CI means no merge, no exceptions.
7. **Tests come with the change**, not in a follow-up PR. If a change is not
   reasonably testable, say so in the PR description.
8. **Do not force-push a branch that is under review.** Add commits instead; the
   final squash hides them.
9. **Announce shared-file edits in the issue thread.** `models.py`,
   `schemas.py`, `frontend/src/types.ts` and `frontend/src/components/*` are
   shared by all three of us — post "I'm touching `models.py` + `schemas.py`
   for #14" before you start so we can sequence the merges.
10. **Decisions live in issues and PRs.** If a call was made on a phone call,
    paste the outcome into the issue. If it isn't written down, it didn't
    happen.

---

## Naming conventions at a glance

| Thing | Format | Example |
| --- | --- | --- |
| Branch | `<type>/<issue>-<slug>` | `fix/21-offer-race-condition` |
| Commit | `<type>(<scope>): <imperative>` | `fix(offers): reject accept on stale offer` |
| PR title | same as a commit message | `feat(catalog): upload listing images` |
| Issue title | imperative outcome | `Add refresh tokens and logout` |

Allowed types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `ci`,
`build`, `revert`.

---

## Getting a development environment

```bash
docker compose up --build -d
docker compose ps
```

| Service | URL |
| --- | --- |
| Frontend | <http://localhost:3000> |
| API docs | <http://localhost:8000/docs> |
| Health | <http://localhost:8000/api/health> |

Seeded admin: `admin@agrimatch.com` / `admin12345` — development only.

---

## Code style

- **Python** — `ruff check` and `ruff format` (config lands with the lint
  baseline issue). Type hints on every function signature.
- **TypeScript** — `npm run lint` and `npm run typecheck` (landing with the
  frontend lint baseline). No `any` unless commented why.
- **Comments** explain *why*, never *what*. The code already says what.

---

## Where to ask questions

Open an issue with the `question` label, or drop it in the PR thread. Prefer
these over private messages so the answer helps the next person.
