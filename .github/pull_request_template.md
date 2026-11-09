<!--
Title format: <type>(<scope>): <imperative summary>
  feat(catalog): upload listing images
Keep it under 400 changed lines. One concern per PR.
-->

## What &amp; why

<!-- Two or three sentences. What changes, and what problem it solves.
     Link the issue: -->
Closes #

## How

<!-- The approach in a short bullet list. Call out anything a reviewer
     would otherwise have to reverse-engineer: a new dependency, a schema
     change, a behaviour change. -->

-
-

## Screenshots / evidence

<!-- Required for anything that changes the UI or a user-facing response.
     Before/after is ideal. Text output is fine for API changes. -->

## Test plan

<!-- How you proved it works. Be specific enough that the reviewer could
     repeat it. -->

- [ ] `pytest` — added/updated tests for ...
- [ ] `npm run build` — passes
- [ ] Manual: <the exact clicks you did>

## Checklist

- [ ] Branch is up to date with `develop` and CI is green
- [ ] Issue is linked above and will close automatically
- [ ] Tests added or updated for the new behaviour
- [ ] No unrelated files, no stray debug prints, no commented-out code
- [ ] Docs updated (`README.md` / `docs/`) if behaviour or setup changed
- [ ] Database change ships with an Alembic migration
- [ ] No new secret, token or password committed

## Reviewer notes

<!-- Optional: where you want the reviewer to look hardest, or a decision
     you were unsure about. Being explicit here gets you better reviews. -->
