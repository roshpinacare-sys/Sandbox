# FLOW MAP · מפת-הזרימה המדודה של האורגניזם

נמדד: 2026-10-11T20:24:07.773Z
צומת=34 · קשת=77 · רפאים=2 · ישנים=1 · יתומים=7 · פנים-מישורי=13 · משולב-דף=12 · צפיפות-זרימה=2.26

| פיד | ריפו | סוג | גיל | חוק-טריות | מי-מייצר | אינטגרציה |
|---|---|---|---|---|---|---|
| `receipts/wallet/verdict.json` | Sandbox | receipt | 0.2h | <=2h | artery-wallet (hourly) | INTEGRATED |
| `receipts/fleet/verdict.json` | Sandbox | receipt | 1.3h | <=3h | artery-fleet (2h) | INTEGRATED |
| `receipts/grid/verdict.json` | Sandbox | receipt | 0.3h | <=1h | artery-grid (30min) | INTEGRATED |
| `receipts/latest.json` | Sandbox | pulse | 0.1h | <=1h | sovereign.yml (~15min) | INTEGRATED |
| `ops/lessons/ledger.md` | Sandbox | lesson | 6.5h | <=26h | artery-scribe (daily) | PLANE-INTERNAL |
| `ops/flow/flow-map.json` | Sandbox | flowmap | **MISSING** | <=4h | artery-flow (3h) | GHOST-SOURCE |
| `receipts/office-ci/verdict.json` | FleetHQ | receipt | -0.0h | <=30h | office-ci (push) | INTEGRATED |
| `office/state/office-state.json` | FleetHQ | state | 0.8h | <=3h | office-heartbeat (2h) | INTEGRATED |
| `digest.json` | FleetHQ | digest | **MISSING** | <=26h | unknown (404 measured 2026-10-11) | GHOST-SOURCE |
| `office/data.json` | Domain | book | 0.8h | <=1h | office-pulse (20min) | INTEGRATED |
| `agents/office-live.json` | Domain | book | 1.1h | <=3h | office-artery (2h) | PLANE-INTERNAL |
| `dex/office-feed.json` | Domain | book | 1.0h | <=26h | office-feed (daily) | INTEGRATED |
| `status.json` | Domain | book | 22.2h | <=30h | pages build | INTEGRATED |
| `dex/agent.json` | Domain | book | 524.0h | <=48h | discovered | PLANE-INTERNAL |
| `dex/bridge.json` | Domain | book | 524.0h | <=48h | discovered | ORPHAN |
| `dex/credits.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/deposits.json` | Domain | book | 4.1h | <=48h | discovered | INTEGRATED |
| `dex/fleet.json` | Domain | book | 524.0h | <=48h | discovered | ORPHAN |
| `dex/grid.json` | Domain | book | 4.1h | <=26h | discovered | INTEGRATED |
| `dex/mirror-stub.json` | Domain | book | 524.0h | <=48h | discovered | ORPHAN |
| `dex/money.json` | Domain | book | 0.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/onramp.json` | Domain | book | 524.0h | <=48h | discovered | ORPHAN |
| `dex/pegout-queue.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pnl-desk.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/portfolio.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/redeem-requests.json` | Domain | book | 175.2h | <=48h | discovered | ORPHAN |
| `dex/relay.json` | Domain | book | 524.0h | <=48h | discovered | ORPHAN |
| `dex/showcase.json` | Domain | book | 524.0h | <=48h | discovered | ORPHAN |
| `dex/state.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/watch.json` | Domain | book | 4.1h | <=26h | discovered | PLANE-INTERNAL |
| `dex/world.json` | Domain | book | 4.1h | <=26h | discovered | INTEGRATED |
| `dex/xc-intents.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-ops.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-requests.json` | Domain | book | 4.1h | <=48h | discovered | PLANE-INTERNAL |

## רפאים (צרכן-חי על מפיק-מת) — flag
- roshpinacare-sys/Domain/index.html (page) -> `roshpinacare-sys/FleetHQ:digest.json`
- roshpinacare-sys/Domain/agents/office-feed.mjs (agent) -> `roshpinacare-sys/FleetHQ:digest.json`

## ישנים-מעבר-חוק (flag)
- roshpinacare-sys/Domain/agents/dex-router.cjs (agent) -> `roshpinacare-sys/Domain:dex/agent.json` age=524.0h

## יתומים (מפיק-שאף-אחד-לא-קורא) — יעדי-זיקוק, flag
- `roshpinacare-sys/Domain:dex/bridge.json` (discovered)
- `roshpinacare-sys/Domain:dex/fleet.json` (discovered)
- `roshpinacare-sys/Domain:dex/mirror-stub.json` (discovered)
- `roshpinacare-sys/Domain:dex/onramp.json` (discovered)
- `roshpinacare-sys/Domain:dex/redeem-requests.json` (discovered)
- `roshpinacare-sys/Domain:dex/relay.json` (discovered)
- `roshpinacare-sys/Domain:dex/showcase.json` (discovered)

## פנים-מישורי (מסתובב-רק-בתוך-האיבר-שמייצר-אותו) — flag
- `roshpinacare-sys/Sandbox:ops/lessons/ledger.md` (artery-scribe (daily))
- `roshpinacare-sys/Domain:agents/office-live.json` (office-artery (2h))
- `roshpinacare-sys/Domain:dex/agent.json` (discovered)
- `roshpinacare-sys/Domain:dex/credits.json` (discovered)
- `roshpinacare-sys/Domain:dex/money.json` (discovered)
- `roshpinacare-sys/Domain:dex/pegout-queue.json` (discovered)
- `roshpinacare-sys/Domain:dex/pnl-desk.json` (discovered)
- `roshpinacare-sys/Domain:dex/portfolio.json` (discovered)
- `roshpinacare-sys/Domain:dex/state.json` (discovered)
- `roshpinacare-sys/Domain:dex/watch.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-intents.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-ops.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-requests.json` (discovered)

## סטיית-תוכן-מול-קומיט (קומיט-חד-של-תוכן-ישן) — flag
- `roshpinacare-sys/Domain:dex/credits.json` commit=4.1h content=29.6h
- `roshpinacare-sys/Domain:dex/grid.json` commit=4.1h content=34.2h
- `roshpinacare-sys/Domain:dex/pegout-queue.json` commit=4.1h content=174.0h
- `roshpinacare-sys/Domain:dex/state.json` commit=4.1h content=29.6h
- `roshpinacare-sys/Domain:dex/world.json` commit=4.1h content=29.6h
- `roshpinacare-sys/Domain:dex/xc-intents.json` commit=4.1h content=166.4h
- `roshpinacare-sys/Domain:dex/xc-ops.json` commit=4.1h content=174.0h
- `roshpinacare-sys/Domain:dex/xc-requests.json` commit=4.1h content=174.0h
