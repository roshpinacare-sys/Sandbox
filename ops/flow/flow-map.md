# FLOW MAP · מפת-הזרימה המדודה של האורגניזם

נמדד: 2026-10-15T21:18:50.857Z
צומת=38 · קשת=83 · רפאים=0 · ישנים=11 · יתומים=6 · פנים-מישורי=21 · משולב-דף=10 · צפיפות-זרימה=2.18

| פיד | ריפו | סוג | גיל | חוק-טריות | מי-מייצר | אינטגרציה |
|---|---|---|---|---|---|---|
| `receipts/wallet/verdict.json` | Sandbox | receipt | 53.6h | <=2h | artery-wallet (hourly) | INTEGRATED |
| `receipts/fleet/verdict.json` | Sandbox | receipt | 54.9h | <=3h | artery-fleet (2h) | INTEGRATED |
| `receipts/grid/verdict.json` | Sandbox | receipt | 2.0h | <=1h | artery-grid (30min) | INTEGRATED |
| `receipts/latest.json` | Sandbox | pulse | 2.0h | <=1h | sovereign.yml (~15min) | INTEGRATED |
| `ops/lessons/ledger.md` | Sandbox | lesson | 82.7h | <=26h | artery-scribe (daily) | ORPHAN |
| `ops/flow/flow-map.json` | Sandbox | flowmap | 3.5h | <=4h | artery-flow (3h) | SELF |
| `receipts/office-ci/verdict.json` | FleetHQ | receipt | 1.0h | <=30h | office-ci (push) | INTEGRATED |
| `office/state/office-state.json` | FleetHQ | state | 0.9h | <=3h | office-heartbeat (2h) | INTEGRATED |
| `digest.json` | FleetHQ | digest | 3.1h | <=26h | unknown (404 measured 2026-10-11) | PLANE-INTERNAL |
| `office/data.json` | Domain | book | 0.1h | <=1h | office-pulse (20min) | INTEGRATED |
| `agents/office-live.json` | Domain | book | 0.8h | <=3h | office-artery (2h) | PLANE-INTERNAL |
| `dex/office-feed.json` | Domain | book | 12.7h | <=26h | office-feed (daily) | PLANE-INTERNAL |
| `status.json` | Domain | book | 0.3h | <=30h | pages build | INTEGRATED |
| `marketing/adsmarket.json` | Domain | book | 79.8h | <=168h | adsmarket-panel (weekly Mon 05:41 UTC + dispatch) | INTEGRATED |
| `dex/agent.json` | Domain | book | 76.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/bridge.json` | Domain | book | 620.9h | <=48h | discovered | ORPHAN |
| `dex/credits.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/deposits.json` | Domain | book | 1.9h | <=48h | discovered | PLANE-INTERNAL |
| `dex/fleet.json` | Domain | book | 620.9h | <=48h | discovered | ORPHAN |
| `dex/giants-gap.json` | Domain | book | 5.8h | <=48h | discovered | ORPHAN |
| `dex/giants.json` | Domain | book | 2.2h | <=48h | discovered | PLANE-INTERNAL |
| `dex/grid.json` | Domain | book | 1.0h | <=26h | discovered | PLANE-INTERNAL |
| `dex/honest-econ.json` | Domain | book | 2.2h | <=48h | discovered | PLANE-INTERNAL |
| `dex/mirror-stub.json` | Domain | book | 620.9h | <=48h | discovered | ORPHAN |
| `dex/money.json` | Domain | book | 1.9h | <=48h | discovered | INTEGRATED |
| `dex/onramp.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pegout-queue.json` | Domain | book | 101.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pnl-desk.json` | Domain | book | 6.9h | <=48h | discovered | PLANE-INTERNAL |
| `dex/portfolio.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/redeem-requests.json` | Domain | book | 272.1h | <=48h | discovered | ORPHAN |
| `dex/relay.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/showcase.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/state.json` | Domain | book | 0.7h | <=48h | discovered | PLANE-INTERNAL |
| `dex/watch.json` | Domain | book | 1.9h | <=26h | discovered | PLANE-INTERNAL |
| `dex/world.json` | Domain | book | 0.7h | <=26h | discovered | PLANE-INTERNAL |
| `dex/xc-intents.json` | Domain | book | 45.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-ops.json` | Domain | book | 101.1h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-requests.json` | Domain | book | 101.1h | <=48h | discovered | PLANE-INTERNAL |

## רפאים (צרכן-חי על מפיק-מת) — flag
- none

## ישנים-מעבר-חוק (flag)
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/wallet/verdict.json` age=53.6h
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/grid/verdict.json` age=2.0h
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/fleet/verdict.json` age=54.9h
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/latest.json` age=2.0h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-ops.json` age=101.1h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-requests.json` age=101.1h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=101.1h
- roshpinacare-sys/Domain/agents/dex-core.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=101.1h
- roshpinacare-sys/Domain/agents/dex-router.cjs (agent) -> `roshpinacare-sys/Domain:dex/agent.json` age=76.1h
- roshpinacare-sys/Domain/agents/dex-xc.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=101.1h
- roshpinacare-sys/Domain/agents/pegout-hand.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=101.1h

## יתומים (מפיק-שאף-אחד-לא-קורא) — יעדי-זיקוק, flag
- `roshpinacare-sys/Sandbox:ops/lessons/ledger.md` (artery-scribe (daily))
- `roshpinacare-sys/Domain:dex/bridge.json` (discovered)
- `roshpinacare-sys/Domain:dex/fleet.json` (discovered)
- `roshpinacare-sys/Domain:dex/giants-gap.json` (discovered)
- `roshpinacare-sys/Domain:dex/mirror-stub.json` (discovered)
- `roshpinacare-sys/Domain:dex/redeem-requests.json` (discovered)

## פנים-מישורי (מסתובב-רק-בתוך-האיבר-שמייצר-אותו) — flag
- `roshpinacare-sys/FleetHQ:digest.json` (unknown (404 measured 2026-10-11))
- `roshpinacare-sys/Domain:agents/office-live.json` (office-artery (2h))
- `roshpinacare-sys/Domain:dex/office-feed.json` (office-feed (daily))
- `roshpinacare-sys/Domain:dex/agent.json` (discovered)
- `roshpinacare-sys/Domain:dex/credits.json` (discovered)
- `roshpinacare-sys/Domain:dex/deposits.json` (discovered)
- `roshpinacare-sys/Domain:dex/giants.json` (discovered)
- `roshpinacare-sys/Domain:dex/grid.json` (discovered)
- `roshpinacare-sys/Domain:dex/honest-econ.json` (discovered)
- `roshpinacare-sys/Domain:dex/onramp.json` (discovered)
- `roshpinacare-sys/Domain:dex/pegout-queue.json` (discovered)
- `roshpinacare-sys/Domain:dex/pnl-desk.json` (discovered)
- `roshpinacare-sys/Domain:dex/portfolio.json` (discovered)
- `roshpinacare-sys/Domain:dex/relay.json` (discovered)
- `roshpinacare-sys/Domain:dex/showcase.json` (discovered)
- `roshpinacare-sys/Domain:dex/state.json` (discovered)
- `roshpinacare-sys/Domain:dex/watch.json` (discovered)
- `roshpinacare-sys/Domain:dex/world.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-intents.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-ops.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-requests.json` (discovered)

## סטיית-תוכן-מול-קומיט (קומיט-חד-של-תוכן-ישן) — flag
- `roshpinacare-sys/Domain:dex/pegout-queue.json` commit=101.1h content=270.9h
- `roshpinacare-sys/Domain:dex/xc-ops.json` commit=101.1h content=270.9h
- `roshpinacare-sys/Domain:dex/xc-requests.json` commit=101.1h content=270.9h
