# Atlabs — AI Video Creation Platform

A functional reconstruction of the Atlabs AI video creation product
(script-to-film, song-to-music-video), rebuilt from live product analysis.

## What this is

A full web application implementing the Atlabs product surface:

- **Start with an Idea/Script** — paste a script, get a fully produced film:
  shots, voiceover, and more (Animated Explainer, Animated Cartoon,
  Realistic Drama)
- **Start with a Song** — drop a song, watch it become a cinematic music
  video in minutes (Kids' Edutainment, Indie Music, Faith & Gospel)
- **My Stories** project management, media/character libraries, mini tools,
  credits & subscription commerce

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + Radix UI primitives
- React Router
- Mock API layer reproducing the captured product API shapes

## Development

```bash
npm install
npm run dev
```

## Reconstruction provenance

Reconstructed from passive product analysis (page structure, route map,
script inventory, API surface shapes) using the REA toolkit on an
operator-authorized authenticated session. No proprietary source code was
copied; all implementation in this repository is original work.

## Repository layout

- `src/pages/**` — route implementations
- `src/components/**` — shared component library
- `src/lib/api/**` — mock API + fixtures
- `docs/**` — reconstruction notes and evidence

Work is organized in work orders dispatched to worker agents; see
`AGENTS.md` and `docs/worker-runbook.md` for the contract.
