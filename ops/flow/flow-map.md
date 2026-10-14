# FLOW MAP · מפת-הזרימה המדודה של האורגניזם

נמדד: 2026-10-14T06:08:43.689Z
צומת=37 · קשת=89 · רפאים=0 · ישנים=10 · יתומים=5 · פנים-מישורי=16 · משולב-דף=15 · צפיפות-זרימה=2.41

| פיד | ריפו | סוג | גיל | חוק-טריות | מי-מייצר | אינטגרציה |
|---|---|---|---|---|---|---|
| `receipts/wallet/verdict.json` | Sandbox | receipt | 14.4h | <=2h | artery-wallet (hourly) | INTEGRATED |
| `receipts/fleet/verdict.json` | Sandbox | receipt | 15.7h | <=3h | artery-fleet (2h) | INTEGRATED |
| `receipts/grid/verdict.json` | Sandbox | receipt | 1.4h | <=1h | artery-grid (30min) | INTEGRATED |
| `receipts/latest.json` | Sandbox | pulse | 1.4h | <=1h | sovereign.yml (~15min) | INTEGRATED |
| `ops/lessons/ledger.md` | Sandbox | lesson | 43.5h | <=26h | artery-scribe (daily) | ORPHAN |
| `ops/flow/flow-map.json` | Sandbox | flowmap | 4.9h | <=4h | artery-flow (3h) | SELF |
| `receipts/office-ci/verdict.json` | FleetHQ | receipt | 0.3h | <=30h | office-ci (push) | INTEGRATED |
| `office/state/office-state.json` | FleetHQ | state | 2.1h | <=3h | office-heartbeat (2h) | INTEGRATED |
| `digest.json` | FleetHQ | digest | 0.2h | <=26h | unknown (404 measured 2026-10-11) | INTEGRATED |
| `office/data.json` | Domain | book | 0.1h | <=1h | office-pulse (20min) | INTEGRATED |
| `agents/office-live.json` | Domain | book | 0.8h | <=3h | office-artery (2h) | INTEGRATED |
| `dex/office-feed.json` | Domain | book | 19.0h | <=26h | office-feed (daily) | INTEGRATED |
| `status.json` | Domain | book | 0.1h | <=30h | pages build | INTEGRATED |
| `marketing/adsmarket.json` | Domain | book | 40.6h | <=168h | adsmarket-panel (weekly Mon 05:41 UTC + dispatch) | INTEGRATED |
| `dex/agent.json` | Domain | book | 37.0h | <=48h | discovered | PLANE-INTERNAL |
| `dex/bridge.json` | Domain | book | 581.7h | <=48h | discovered | ORPHAN |
| `dex/credits.json` | Domain | book | 0.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/deposits.json` | Domain | book | 3.9h | <=48h | discovered | INTEGRATED |
| `dex/fleet.json` | Domain | book | 581.7h | <=48h | discovered | ORPHAN |
| `dex/giants.json` | Domain | book | 5.5h | <=48h | discovered | PLANE-INTERNAL |
| `dex/grid.json` | Domain | book | 0.6h | <=26h | discovered | INTEGRATED |
| `dex/honest-econ.json` | Domain | book | 5.5h | <=48h | discovered | PLANE-INTERNAL |
| `dex/mirror-stub.json` | Domain | book | 581.7h | <=48h | discovered | ORPHAN |
| `dex/money.json` | Domain | book | 3.9h | <=48h | discovered | PLANE-INTERNAL |
| `dex/onramp.json` | Domain | book | 0.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pegout-queue.json` | Domain | book | 61.9h | <=48h | discovered | PLANE-INTERNAL |
| `dex/pnl-desk.json` | Domain | book | 11.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/portfolio.json` | Domain | book | 0.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/redeem-requests.json` | Domain | book | 233.0h | <=48h | discovered | ORPHAN |
| `dex/relay.json` | Domain | book | 0.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/showcase.json` | Domain | book | 0.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/state.json` | Domain | book | 0.6h | <=48h | discovered | PLANE-INTERNAL |
| `dex/watch.json` | Domain | book | 3.9h | <=26h | discovered | PLANE-INTERNAL |
| `dex/world.json` | Domain | book | 5.5h | <=26h | discovered | INTEGRATED |
| `dex/xc-intents.json` | Domain | book | 5.9h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-ops.json` | Domain | book | 61.9h | <=48h | discovered | PLANE-INTERNAL |
| `dex/xc-requests.json` | Domain | book | 61.9h | <=48h | discovered | PLANE-INTERNAL |

## רפאים (צרכן-חי על מפיק-מת) — flag
- none

## ישנים-מעבר-חוק (flag)
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/wallet/verdict.json` age=14.4h
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/grid/verdict.json` age=1.4h
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/fleet/verdict.json` age=15.7h
- roshpinacare-sys/Domain/agents/office-pulse.cjs (agent) -> `roshpinacare-sys/Sandbox:receipts/latest.json` age=1.4h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-ops.json` age=61.9h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/xc-requests.json` age=61.9h
- roshpinacare-sys/Domain/.github/workflows/dex-xc-cron.yml (workflow) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=61.9h
- roshpinacare-sys/Domain/agents/dex-core.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=61.9h
- roshpinacare-sys/Domain/agents/dex-xc.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=61.9h
- roshpinacare-sys/Domain/agents/pegout-hand.cjs (agent) -> `roshpinacare-sys/Domain:dex/pegout-queue.json` age=61.9h

## יתומים (מפיק-שאף-אחד-לא-קורא) — יעדי-זיקוק, flag
- `roshpinacare-sys/Sandbox:ops/lessons/ledger.md` (artery-scribe (daily))
- `roshpinacare-sys/Domain:dex/bridge.json` (discovered)
- `roshpinacare-sys/Domain:dex/fleet.json` (discovered)
- `roshpinacare-sys/Domain:dex/mirror-stub.json` (discovered)
- `roshpinacare-sys/Domain:dex/redeem-requests.json` (discovered)

## פנים-מישורי (מסתובב-רק-בתוך-האיבר-שמייצר-אותו) — flag
- `roshpinacare-sys/Domain:dex/agent.json` (discovered)
- `roshpinacare-sys/Domain:dex/credits.json` (discovered)
- `roshpinacare-sys/Domain:dex/giants.json` (discovered)
- `roshpinacare-sys/Domain:dex/honest-econ.json` (discovered)
- `roshpinacare-sys/Domain:dex/money.json` (discovered)
- `roshpinacare-sys/Domain:dex/onramp.json` (discovered)
- `roshpinacare-sys/Domain:dex/pegout-queue.json` (discovered)
- `roshpinacare-sys/Domain:dex/pnl-desk.json` (discovered)
- `roshpinacare-sys/Domain:dex/portfolio.json` (discovered)
- `roshpinacare-sys/Domain:dex/relay.json` (discovered)
- `roshpinacare-sys/Domain:dex/showcase.json` (discovered)
- `roshpinacare-sys/Domain:dex/state.json` (discovered)
- `roshpinacare-sys/Domain:dex/watch.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-intents.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-ops.json` (discovered)
- `roshpinacare-sys/Domain:dex/xc-requests.json` (discovered)

## סטיית-תוכן-מול-קומיט (קומיט-חד-של-תוכן-ישן) — flag
- `roshpinacare-sys/Domain:dex/pegout-queue.json` commit=61.9h content=231.8h
- `roshpinacare-sys/Domain:dex/xc-ops.json` commit=61.9h content=231.7h
- `roshpinacare-sys/Domain:dex/xc-requests.json` commit=61.9h content=231.8h
