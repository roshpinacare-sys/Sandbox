# FLOW MAP · מפת-הזרימה המדודה של האורגניזם

נמדד: 2026-10-22T16:30:59.059Z
צומת=40 · קשת=130 · רפאים=0 · ישנים=16 · יתומים=3 · פנים-מישורי=25 · משולב-דף=11 · צפיפות-זרימה=3.25

| פיד | ריפו | סוג | גיל | חוק-טריות | מי-מייצר | אינטגרציה |
|---|---|---|---|---|---|---|
| `receipts/wallet/verdict.json` | Sandbox | receipt | 0.7h | <=2h | artery-wallet (hourly) | INTEGRATED |
| `receipts/fleet/verdict.json` | Sandbox | receipt | 2.2h | <=3h | artery-fleet (2h) | INTEGRATED |
| `receipts/grid/verdict.json` | Sandbox | receipt | 0.2h | <=1h | artery-grid (30min) | INTEGRATED |
| `receipts/latest.json` | Sandbox | pulse | 0.5h | <=1h | sovereign.yml (~15min) | INTEGRATED |
| `ops/lessons/ledger.md` | Sandbox | lesson | 1.4h | <=26h | artery-scribe (daily) | PLANE-INTERNAL |
| `ops/flow/flow-map.json` | Sandbox | flowmap | 3.6h | <=4h | artery-flow (3h) | SELF |
| `receipts/office-ci/verdict.json` | FleetHQ | receipt | 1.0h | <=30h | office-ci (push) | INTEGRATED |
| `office/state/office-state.json` | FleetHQ | state | 1.1h | <=3h | office-heartbeat (2h) | INTEGRATED |
| `digest.json` | FleetHQ | digest | 1.9h | <=26h | unknown (404 measured 2026-10-11) | PLANE-INTERNAL |
| `office/data.json` | Domain | book | 0.3h | <=1h | office-pulse (20min) | INTEGRATED |
| `agents/office-live.json` | Domain | book | 2.1h | <=3h | office-artery (2h) | PLANE-INTERNAL |
| `dex/office-feed.json` | Domain | book | 7.6h | <=26h | office-feed (daily) | PLANE-INTERNAL |
| `status.json` | Domain | book | 0.1h | <=30h | pages build | INTEGRATED |
| `marketing/adsmarket.json` | Domain | book | 0.1h | <=168h | adsmarket-panel (weekly Mon 05:41 UTC + dispatch) | INTEGRATED |
| `dex/agent.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/bridge.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/credits.json` | Domain | book | 0.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/deposits.json` | Domain | book | 2.3h | <=48h | discovered | PLANE-INTERNAL |
| `dex/fleet.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/giants-gap.json` | Domain | book | 144.8h | <=48h | discovered | ORPHAN |
| `dex/giants.json` | Domain | book | 0.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/grid.json` | Domain | book | 0.8h | <=26h | discovered | PLANE-INTERNAL |
| `dex/honest-econ.json` | Domain | book | 0.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/mirror-stub.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/money.json` | Domain | book | 0.8h | <=48h | discovered | INTEGRATED |
| `dex/onramp.json` | Domain | book | 0.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pegout-queue.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pnl-desk.json` | Domain | book | 2.3h | <=48h | discovered | PLANE-INTERNAL |
| `dex/portfolio.json` | Domain | book | 0.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/redeem-requests.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/relay.json` | Domain | book | 0.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/showcase.json` | Domain | book | 0.4h | <=48h | discovered | PLANE-INTERNAL |
| `dex/state.json` | Domain | book | 0.4h | <=48h | discovered | INTEGRATED |
| `dex/vault-census.json` | Domain | book | 28.2h | <=48h | discovered | ORPHAN |
| `dex/vault-guardian.json` | Domain | book | 28.2h | <=48h | discovered | ORPHAN |
| `dex/watch.json` | Domain | book | 2.3h | <=26h | discovered | PLANE-INTERNAL |
| `dex/world.json` | Domain | book | 0.4h | <=26h | discovered | PLANE-INTERNAL |
| `dex/xc-intents.json` | Domain | book | 138.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-ops.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-requests.json` | Domain | book | 144.8h | <=48h | discovered | PLANE-INTERNAL |

## רפאים (צרכן-חי על מפיק-מת) — flag
- none

## ישנים-מעבר-חוק (flag)
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/bridge.json` age=144.8h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/fleet.json` age=144.8h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/redeem-requests.json` age=144.8h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (learner) -> `roshpinacare-sys/Domain:dex/mirror-stub.json` age=144.8h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-intents.json` age=138.7h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-ops.json` age=144.8h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-requests.json` age=144.8h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=144.8h
- roshpinacare-sys/Domain/agents/dex-core.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=144.8h
- roshpinacare-sys/Domain/agents/dex-router.cjs (agent) -> `roshpinacare-sys/Domain:dex/agent.json` age=144.8h
- roshpinacare-sys/Domain/agents/dex-xc.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=144.8h
- roshpinacare-sys/Domain/agents/pegout-hand.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=144.8h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/bridge.json` age=144.8h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/fleet.json` age=144.8h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/redeem-requests.json` age=144.8h
- roshpinacare-sys/Sandbox/engine/scribe.mjs (engine) -> `roshpinacare-sys/Domain:dex/mirror-stub.json` age=144.8h

## יתומים (מפיק-שאף-אחד-לא-קורא) — יעדי-זיקוק, flag
- `roshpinacare-sys/Domain:dex/giants-gap.json` (discovered)
- `roshpinacare-sys/Domain:dex/vault-census.json` (discovered)
- `roshpinacare-sys/Domain:dex/vault-guardian.json` (discovered)

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
- `roshpinacare-sys/Domain:dex/watch.json` (discovered)
- `roshpinacare-sys/Domain:dex/world.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-intents.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-ops.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-requests.json` (discovered)

## סטיית-תוכן-מול-קומיט (קומיט-חד-של-תוכן-ישן) — flag
- `roshpinacare-sys/Domain:dex/giants-gap.json` commit=144.8h content=169.3h
- `roshpinacare-sys/Domain:dex/pegout-queue.json` commit=144.8h content=434.1h
- `roshpinacare-sys/Domain:dex/xc-ops.json` commit=144.8h content=434.1h
- `roshpinacare-sys/Domain:dex/xc-requests.json` commit=144.8h content=434.1h
