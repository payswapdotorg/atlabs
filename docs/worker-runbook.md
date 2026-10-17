# Worker runbook

1. Read your work-order brief completely before writing code.
2. Clone the repo, create your branch from the dispatch base SHA in the brief.
3. Implement only your owned surfaces.
4. Verify: `npm run build` && `npx tsc --noEmit` exit 0; dev server renders.
5. Commit atomically. Push the branch.
6. Open exactly one PR (base `main`) via the GitHub API with the token from
   your brief env. PR body: work order, dispatch base, final head, owned
   paths, implementation summary, verification (commands + exit codes),
   what is mocked/stubbed, limitations.
7. Stop. The TL reviews and merges.
