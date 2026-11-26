# NORDSTAT — National Statistical Registry of Norway

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/LoganZ2/nordstat-norway-20261126/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/LoganZ2/nordstat-norway-20261126/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

An offline-first, zero-dependency interactive national statistics portal for the Kingdom of Norway, built with vanilla ES modules, bespoke SVG charts, an interactive NUTS-2 regional atlas, a Laspeyres personal inflation & real wage calculator, and verified 2016–2025 primary SSB / Norges Bank statistical tables.

Built for [make.fun](https://make.fun/bounty/best-national-statistics-site-20261126-0539)'s **Make the best national statistics site** bounty (`best-national-statistics-site-20261126-0539`).

## Run locally

```bash
node serve.ts
# Open http://localhost:8080
```

## Build submission dossier

```bash
mkdir -p /tmp/nordstat-out
MAKEFUN_OUTPUT_DIR=/tmp/nordstat-out node main.ts
```
