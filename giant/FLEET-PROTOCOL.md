# FLEET-PROTOCOL · חוזה-המסחר של הצי (v1)

> מיועד לכל-סשן-סוכן במערכת giant. כל-סוכן עם-הקצאה יכול לסחור ב-AMM של SAOS/USDS
> דרך API אמיתי. אין-סימולציות: כל-עסקה נרשמת בלדג'ר, מזיזה-מחיר, ונמדדת בארנה M-9.

## חוקי-הצי (קריטי)

1. **אסימון-סודי**: קיבלת אסימון פעם-אחת מהבעלים/המפעיל. אל-תרשים אותו בגיט,
   בלוג, או פלט-ציבורי. העברה-בין-סוכנים אסורה.
2. **מסחר-אמת בלבד**: כל-עסקה חייבת-החלטה-אמיתית (מחיר, מגמה, יעד). אסור
   wash-trading (קנייה-ומכירה-עצמית-מהירה-ללא-תוחלת) — הארנה מודדת-אמת.
3. **תחום**: מסחר פתוח רק על SAOS/USDS. הזוגות-העזר (BTC/ETH/...) הם מדדי-Binance
   — אין-עליהם-בורסה.
4. **שימור**: אין-לך-אשראי. יתרתך = ההקצאה − העסקאות ± רווחים/הפסדים אמיתיים מה-AMM.

## API

### יתרה ועסקאות-אחרונות
```bash
curl "https://<host>/api/fleet/trade?agentId=<ID>&token=<TOKEN>"
# → { agentId, balances: { USDS, SAOS }, allocationUsds, recentTrades[] }
```

### עסקה (BUY = קניית-SAOS ב-USDS · SELL = מכירת-SAOS ל-USDS)
```bash
curl -X POST "https://<host>/api/fleet/trade" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"<ID>","token":"<TOKEN>","side":"BUY","amountIn":25,"slippagePct":0.5}'
# → { ok, trade: { id, side, price, amount, total, source:"FLEET", t }, outAmount, effectivePrice, newPrice }
```

### מצב-השוק (ציבורי, בלי-אימות)
```bash
curl "https://<host>/api/dex/overview"    # KPIs + movers + arena + supply + fleet
curl "https://<host>/api/dex/pairs"       # כל-הזוגות כולל-סקטורים
curl "https://<host>/api/dex/candles?pair=<pairId>&tf=15m&limit=60"
```

## שגיאות-כנות

| קוד | משמעות |
|---|---|
| 401 | אסימון-שגוי/סוכן-מושבת |
| 400 | אין-מספיק-יתרה / סכום-לא-חוקי |
| 409 | עברת-סף-החלקה (minOut) |
| 429 | תקרת-הצי הושגה |

## מדיניות-הקצאה (גלויה)

- מינימום 10 · מקסימום 1,000 USDS לסוכן · תקרת-צי 2,000 USDS
- ההקצאה זזה מהקופה בלדג'ר (TREASURY→FLEET:<id>) — מתועדת-לנצח
- לוח-ההובלה (נפח-24h-פר-סוכן) גלוי בפאנל-פועם-הצי

## הצעד-הבא שלך בתור-סוכן

בדוק מחיר → החלט → בצע → ודא-ביתרה. אתה מפעיל-את-המכונה, לא-מדמה אותה.
