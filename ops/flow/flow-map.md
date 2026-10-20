# FLOW MAP · מפת-הזרימה המדודה של האורגניזם

נמדד: 2026-10-20T18:09:00.842Z
צומת=38 · קשת=128 · רפאים=0 · ישנים=22 · יתומים=1 · פנים-מישורי=26 · משולב-דף=10 · צפיפות-זרימה=3.37

| פיד | ריפו | סוג | גיל | חוק-טריות | מי-מייצר | אינטגרציה |
|---|---|---|---|---|---|---|
| `receipts/wallet/verdict.json` | Sandbox | receipt | 1.1h | <=2h | artery-wallet (hourly) | INTEGRATED |
| `receipts/fleet/verdict.json` | Sandbox | receipt | 1.3h | <=3h | artery-fleet (2h) | INTEGRATED |
| `receipts/grid/verdict.json` | Sandbox | receipt | 0.7h | <=1h | artery-grid (30min) | INTEGRATED |
| `receipts/latest.json` | Sandbox | pulse | 0.2h | <=1h | sovereign.yml (~15min) | INTEGRATED |
| `ops/lessons/ledger.md` | Sandbox | lesson | 2.0h | <=26h | artery-scribe (daily) | PLANE-INTERNAL |
| `ops/flow/flow-map.json` | Sandbox | flowmap | 3.5h | <=4h | artery-flow (3h) | SELF |
| `receipts/office-ci/verdict.json` | FleetHQ | receipt | 1.3h | <=30h | office-ci (push) | INTEGRATED |
| `office/state/office-state.json` | FleetHQ | state | 1.3h | <=3h | office-heartbeat (2h) | INTEGRATED |
| `digest.json` | FleetHQ | digest | 1.2h | <=26h | unknown (404 measured 2026-10-11) | PLANE-INTERNAL |
| `office/data.json` | Domain | book | 0.0h | <=1h | office-pulse (20min) | INTEGRATED |
| `agents/office-live.json` | Domain | book | 0.6h | <=3h | office-artery (2h) | PLANE-INTERNAL |
| `dex/office-feed.json` | Domain | book | 9.3h | <=26h | office-feed (daily) | PLANE-INTERNAL |
| `status.json` | Domain | book | 0.0h | <=30h | pages build | INTEGRATED |
| `marketing/adsmarket.json` | Domain | book | 30.9h | <=168h | adsmarket-panel (weekly Mon 05:41 UTC + dispatch) | INTEGRATED |
| `dex/agent.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/bridge.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/credits.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/deposits.json` | Domain | book | 0.0h | <=48h | discovered | PLANE-INTERNAL |
| `dex/fleet.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/giants-gap.json` | Domain | book | 98.4h | <=48h | discovered | ORPHAN |
| `dex/giants.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/grid.json` | Domain | book | 3.3h | <=26h | discovered | PLANE-INTERNAL |
| `dex/honest-econ.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/mirror-stub.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/money.json` | Domain | book | 91.9h | <=48h | discovered | INTEGRATED |
| `dex/onramp.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pegout-queue.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pnl-desk.json` | Domain | book | 5.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/portfolio.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/redeem-requests.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/relay.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/showcase.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/state.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/watch.json` | Domain | book | 0.0h | <=26h | discovered | PLANE-INTERNAL |
| `dex/world.json` | Domain | book | 0.7h | <=26h | discovered | PLANE-INTERNAL |
| `dex/xc-intents.json` | Domain | book | 92.3h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-ops.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-requests.json` | Domain | book | 98.4h | <=48h | discovered | PLANE-INTERNAL |

## רפאים (צרכן-חי על מפיק-מת) — flag
- none

## ישנים-מעבר-חוק (flag)
- roshpinacare-sys/Domain/index.html (page) -> `roshpinacare-sys/Domain:dex/money.json` age=91.9h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/bridge.json` age=98.4h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/fleet.json` age=98.4h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/redeem-requests.json` age=98.4h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/mirror-stub.json` age=98.4h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-intents.json` age=92.3h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-ops.json` age=98.4h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-requests.json` age=98.4h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=98.4h
- roshpinacare-sys/Domain/.github/workflows/mirror-from-console.yml (workflow) -> `roshpinacare-sys/Domain:dex/money.json` age=91.9h
- roshpinacare-sys/Domain/agents/dex-core.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=98.4h
- roshpinacare-sys/Domain/agents/dex-router.cjs (agent) -> `roshpinacare-sys/Domain:dex/agent.json` age=98.4h
- roshpinacare-sys/Domain/agents/dex-xc.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=98.4h
- roshpinacare-sys/Domain/agents/mirror-from-console.mjs (agent) -> `roshpinacare-sys/Domain:dex/money.json` age=91.9h
- roshpinacare-sys/Domain/agents/moment-watch.mjs (agent) -> `roshpinacare-sys/Domain:dex/money.json` age=91.9h
- roshpinacare-sys/Domain/agents/money-watch.mjs (agent) -> `roshpinacare-sys/Domain:dex/money.json` age=91.9h
- roshpinacare-sys/Domain/agents/pegout-hand.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=98.4h
- roshpinacare-sys/Domain/agents/watch.mjs (agent) -> `roshpinacare-sys/Domain:dex/money.json` age=91.9h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/bridge.json` age=98.4h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/fleet.json` age=98.4h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/redeem-requests.json` age=98.4h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/mirror-stub.json` age=98.4h

## יתומים (מפיק-שאף-אחד-לא-קורא) — יעדי-זיקוק, flag
- `roshpinacare-sys/Domain:dex/giants-gap.json` (discovered)

## פנים-מישורי (מסתובב-רק-בתוך-האיבר-שמייצר-אותו) — flag
- `roshpinacare-sys/Sandbox:ops/lessons/ledger.md` (artery-scribe (daily))
- `roshpinacare-sys/FleetHQ:digest.json` (unknown (404 measured 2026-10-11))
- `roshpinacare-sys/Domain:agents/office-live.json` (office-artery (2h))
- `roshpinacare-sys/Domain:dex/office-feed.json` (office-feed (daily))
- `roshpinacare-sys/Domain:dex/agent.json` (discovered)
- `roshpinacare-sys/Domain:dex/bridge.json` (discovered)
- `roshpinacare-sys/Domain:dex/credits.json` (discovered)
- `roshpinacare-sys/Domain:dex/deposits.json` (discovered)
- `roshpinacare-sys/Domain:dex/fleet.json` (discovered)
- `roshpinacare-sys/Domain:dex/giants.json` (discovered)
- `roshpinacare-sys/Domain:dex/grid.json` (discovered)
- `roshpinacare-sys/Domain:dex/honest-econ.json` (discovered)
- `roshpinacare-sys/Domain:dex/mirror-stub.json` (discovered)
- `roshpinacare-sys/Domain:dex/onramp.json` (discovered)
- `roshpinacare-sys/Domain:dex/pegout-queue.json` (discovered)
- `roshpinacare-sys/Domain:dex/pnl-desk.json` (discovered)
- `roshpinacare-sys/Domain:dex/portfolio.json` (discovered)
- `roshpinacare-sys/Domain:dex/redeem-requests.json` (discovered)
- `roshpinacare-sys/Domain:dex/relay.json` (discovered)
- `roshpinacare-sys/Domain:dex/showcase.json` (discovered)
- `roshpinacare-sys/Domain:dex/state.json` (discovered)
- `roshpinacare-sys/Domain:dex/watch.json` (discovered)
- `roshpinacare-sys/Domain:dex/world.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-intents.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-ops.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-requests.json` (discovered)

## סטיית-תוכן-מול-קומיט (קומיט-חד-של-תוכן-ישן) — flag
- `roshpinacare-sys/Domain:dex/giants-gap.json` commit=98.4h content=122.9h
- `roshpinacare-sys/Domain:dex/pegout-queue.json` commit=98.4h content=387.8h
- `roshpinacare-sys/Domain:dex/xc-ops.json` commit=98.4h content=387.7h
- `roshpinacare-sys/Domain:dex/xc-requests.json` commit=98.4h content=387.8h
