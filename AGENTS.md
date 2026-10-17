# AGENTS.md — the agent contract for payswapdotorg/atlabs

## Roles

- **Tech Lead (TL):** dispatches work orders, reviews PRs, merges, keeps
  `docs/ROADMAP.md` current. The TL does not implement.
- **Workers:** implement exactly one work order per session, push one branch,
  open one PR, stop at TL review. Workers never merge their own PRs.

## Ground rules

1. **One work order per worker session.** Do only what your brief says.
   Never implement another work order's surface, even if it looks unfinished.
2. **Write surfaces are strict.** Each work order owns specific directories.
   Touching another work order's owned surface without an explicit TL
   instruction is a hard review failure.
3. **The stack is locked:** Vite + React 18 + TypeScript + Tailwind CSS +
   Radix UI + React Router. No framework substitutions, no UI-kit swaps.
4. **Quality gates before push:** `npm run build` exits 0;
   `npx tsc --noEmit` exits 0; the dev server renders your routes; no
   console errors on your pages beyond network mocks not yet wired.
5. **Honesty in the PR body:** state what is done, what is stubbed, what is
   mocked. Never claim an acceptance item you did not verify.
6. **Atomic commits, descriptive messages.** Push your branch, open the PR
   via the GitHub API, stop. The TL reviews and merges.

## Mock data discipline

All API calls go through `src/lib/api/` (typed client + fixtures). Pages
never hardcode raw fetch URLs. Fixtures reproduce the documented shapes in
`docs/api-surface.md`.

## Branding

The product name is **Atlabs**. Logo: wordmark + stylized play/film glyph.
Primary accent: yellow (Radix yellow scale on gray neutrals — see
`docs/design-tokens.md`). Light theme default.
