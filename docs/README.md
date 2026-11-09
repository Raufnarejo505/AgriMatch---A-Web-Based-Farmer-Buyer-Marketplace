# Team documentation

Everything about *how* we work, as opposed to what the product does. Start with
[CONTRIBUTING.md](../CONTRIBUTING.md) — it links here.

| Document | Read it when | Owner |
| --- | --- | --- |
| [TEAM_PLAYBOOK.md](TEAM_PLAYBOOK.md) | Before your first commit. Branching, commits, PRs, reviews, merges, conflicts. | Rauf |
| [TASK_ASSIGNMENT.md](TASK_ASSIGNMENT.md) | Before your first issue. Who owns what, and the day-by-day plan. | Rauf |
| [BACKLOG.md](BACKLOG.md) | Every Monday. The 25 prioritised work items and what is deliberately out of scope. | Everyone |
| [GITHUB_SETUP.md](GITHUB_SETUP.md) | Once, and again when something feels unenforced. Repository settings, branch protection, labels. | Rauf |

## The short version

```
issue  ->  branch  ->  commit  ->  pull request  ->  review  ->  squash merge
```

- Branch from `develop`, never commit to `main` or `develop`.
- `<type>/<issue>-<slug>` — `feat/12-refresh-tokens`
- Conventional Commits; the PR title is what lands on `develop`.
- One approval from someone who did not write it. CI green. Squash merge.
- Declare edits to `models.py`, `schemas.py` and `types.ts` in the issue thread
  before you start — those three files are shared.

## Where the automation lives

| File | What it does |
| --- | --- |
| `.github/CODEOWNERS` | Routes reviews to the owner of each directory |
| `.github/pull_request_template.md` | The PR checklist |
| `.github/ISSUE_TEMPLATE/*` | Task, bug and feature forms |
| `scripts/bootstrap-github.ps1` | One-shot creation of labels, milestones and issues |
| `scripts/issues.json` | The backlog as data |
